import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as session from 'express-session'
import * as helmet from 'helmet'
import * as sessionFileStore from 'session-file-store'
import * as auth from './auth'
import {getConfigValue, showFeature} from './configuration'
import {
    APP_INSIGHTS_SECRET,
    FEATURE_HELMET_ENABLED,
    FEATURE_SECURE_COOKIE_ENABLED,
    HELMET,
    NOW,
    PROTOCOL,
    SESSION_SECRET,
} from './configuration/references'
import {router as documentRouter} from './documents/routes'
import {router as emAnnoRouter} from './emAnno/routes'
import healthCheck from './healthCheck'
import {errorStack} from './lib/errorStack'
import * as log4jui from './lib/log4jui'
import authInterceptor from './lib/middleware/auth'
import {JUILogger} from './lib/models'
import * as tunnel from './lib/tunnel'
import * as postCodeLookup from './postCodeLookup'
import {router as printRouter} from './print/routes'
import routes from './routes'
import {router as termsAndCRoutes} from './termsAndConditions/routes'
import {router as userTandCRoutes} from './userTermsAndConditions/routes'

export const app = express()
if (showFeature(FEATURE_HELMET_ENABLED)) {
    console.log('Helmet enabled')
    app.use(helmet(getConfigValue(HELMET)))
}

const FileStore = sessionFileStore(session)

app.set('trust proxy', 1)
app.use(
    session({
        cookie: {
            httpOnly: true,
            maxAge: 1800000,
            secure: showFeature(FEATURE_SECURE_COOKIE_ENABLED),
        },
        name: 'xui-webapp', // keep as string
        resave: true,
        saveUninitialized: true,
        secret: getConfigValue(SESSION_SECRET),
        // TODO: remove this and use values from cookie token instead
        store: new FileStore({
            path: getConfigValue(NOW) ? '/tmp/sessions' : '.sessions',
        }),
    })
)

app.use(cookieParser())

app.use(errorStack)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

tunnel.init()

app.get('/oauth2/callback', auth.authenticateUser)
app.get('/api/logout', (req, res) => {
    auth.doLogout(req, res)
})

app.get('/api/addresses', authInterceptor, postCodeLookup.doLookup)

app.get('/api/monitoring-tools', (req, res) => {
    res.send({key: getConfigValue(APP_INSIGHTS_SECRET)})
})

app.use('/api/healthCheck', healthCheck)

app.use('/aggregated', routes)
app.use('/data', routes)
app.use('/api/userTermsAndConditions', userTandCRoutes)
app.use('/api/termsAndConditions', termsAndCRoutes)
// separate route for document upload/view
app.use('/documents', documentRouter)
app.use('/em-anno', emAnnoRouter)

app.use('/print', printRouter)

// @ts-ignore
const logger: JUILogger = log4jui.getLogger('Application')
logger.info(`Started up using ${getConfigValue(PROTOCOL)}`)
