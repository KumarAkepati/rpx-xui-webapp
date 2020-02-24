import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { TermsConditionsService } from 'src/app/services/terms-and-conditions/terms-and-conditions.service';
import { AppConfigService } from '../../services/config/configuration.services';
import * as fromActions from '../actions';

@Injectable()
export class AppEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly configurationServices: AppConfigService,
    private readonly authService: AuthService,
    private readonly termsService: TermsConditionsService
  ) { }

  @Effect()
  public config = this.actions$.pipe(
    ofType(fromActions.APP_LOAD_CONFIG),
    switchMap(() => {
      return this.configurationServices.load()
        .pipe(
          map(config => new fromActions.LoadConfigSuccess(config)),
          catchError(error => of(new fromActions.LoadConfigFail(error))
          ));
    })
  );

  @Effect({ dispatch: false })
  public setConfig = this.actions$.pipe(
    ofType(fromActions.APP_LOAD_CONFIG_SUCCESS),
    map(() => {
      this.configurationServices.setConfiguration();
    })
  );


  @Effect({ dispatch: false })
  public logout = this.actions$.pipe(
    ofType(fromActions.LOGOUT),
    map(() => {
      this.authService.signOut();
    })
  );

  @Effect()
  public loadTermsConditions$ = this.actions$.pipe(
    ofType(fromActions.LOAD_TERMS_CONDITIONS),
    switchMap(() => {
      return this.termsService.getTermsConditions().pipe(
        map(doc => new fromActions.LoadTermsConditionsSuccess(doc)),
        catchError(err => of(new fromActions.Go({ path: ['/service-down'] })))
      );
    })
  );
}
