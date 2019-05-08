import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule} from '@angular/core';
import { AppComponent } from './containers/app/app.component';
import { LoggerModule } from './services/logger/logger.module';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { OrgManagerModule } from 'src/org-manager/org-manager.module';
// ngrx modules - START
import {EffectsModule} from '@ngrx/effects';
import {MetaReducer, Store, StoreModule} from '@ngrx/store';
import {RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {storeFreeze} from 'ngrx-store-freeze';
export const metaReducers: MetaReducer<any>[] = !environment.production
  ? [storeFreeze]
  : [];
// ngrx modules - END
// APP store
import {CustomSerializer, reducers} from './store/reducers';
import {effects} from './store/effects';

import {initApplication} from './app-initilizer';

// common provider
import {ProvidersModule} from './providers/providers.module';
// app routes
import { ROUTES } from './app.routes';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ProvidersModule.forRoot(),
    RouterModule.forRoot(ROUTES),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot(effects),
    StoreRouterConnectingModule,
    OrgManagerModule,
    StoreDevtoolsModule.instrument({
      logOnly: environment.production
    }),
    LoggerModule // TODO remove make it service and part of providerModule
  ],
  providers: [
    {
      provide: RouterStateSerializer,
      useClass: CustomSerializer },
    {
      provide: APP_INITIALIZER,
      useFactory: initApplication,
      deps: [Store],
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
