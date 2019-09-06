import * as healthcheck from '@hmcts/nodejs-healthcheck'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as session from 'express-session'
import * as globalTunnel from 'global-tunnel-ng'
import * as sessionFileStore from 'session-file-store'
import * as auth from './auth'
import { config } from './config'
import { errorStack } from './lib/errorStack'
import * as log4jui from './lib/log4jui'
import * as postCodeLookup from './postCodeLookup'
import routes from './routes'

config.environment = process.env.XUI_ENV || 'local'

export const app = express()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const FileStore = sessionFileStore(session)

app.set('trust proxy', 1)

app.use(
    session({
        cookie: {
            httpOnly: true,
            maxAge: 1800000,
            secure: config.secureCookie !== false,
        },
        name: 'jui-webapp',
        resave: true,
        saveUninitialized: true,
        secret: config.sessionSecret,
        store: new FileStore({
            path: process.env.NOW ? '/tmp/sessions' : '.sessions',
        }),
    })
)

app.use(errorStack)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use((req, res, next) => {
    // Set cookie for angular to know which config to use
    const platform = process.env.XUI_ENV || 'local'
    res.cookie('platform', platform)
    next()
})

if (config.proxy) {
    globalTunnel.initialize({
        host: config.proxy.host,
        port: config.proxy.port,
    })
}

function healthcheckConfig(msUrl) {
    return healthcheck.web(`${msUrl}/health`, {
        deadline: 6000,
        timeout: 6000,
    })
}

const healthchecks = {
    checks: {
        ccdDataApi: healthcheckConfig(config.services.ccd.dataApi),
        ccdDefApi: healthcheckConfig(config.services.ccd.componentApi),
        idamApi: healthcheckConfig(config.services.idam.idamApiUrl),
        s2s: healthcheckConfig(config.services.s2s),
    },
}

healthcheck.addTo(app, healthchecks)

app.get('/oauth2/callback', auth.authenticateUser)
app.get('/api/logout', (req, res, next) => {
    auth.doLogout(req, res)
})
app.get('/api/addresses', (req, res, next) => {
    postCodeLookup.doLookup(req, res, next)
})

app.get('/api/monitoring-tools', (req, res, next) => {
    res.send({key: config.appInsightsInstrumentationKey})
})

app.use('/aggregated', routes)
app.use('/data', routes)

const logger = log4jui.getLogger('Application')
logger.info(`Started up on ${config.environment || 'local'} using ${config.protocol}`)
