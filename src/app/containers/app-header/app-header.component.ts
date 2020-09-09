import {Component, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';

import {AppConstants} from '../../app.constants';
import {NavItemsModel} from '../../models/nav-item.model';
import {AppTitleModel} from '../../models/app-title.model';
import {UserNavModel} from '../../models/user-nav.model';
import * as fromActions from '../../store';
import {CookieService} from 'ngx-cookie';
import {Observable, of, Subscription} from 'rxjs';
import {AppUtils} from '../../app-utils';

@Component({
  selector: 'exui-app-header',
  templateUrl: './app-header.component.html',
})

/**
 * AppHeaderComponent
 *
 * TODO: There is no App Header Component in MO.
 * I initially believed that this component could be an unnecessary abstraction.
 *
 * But everywhere in this project we use exui-app-header.
 *
 * But this takes in application constants and passes it down to other components, which makes sense, so that
 * components in the component folder are pure.
 */
export class AppHeaderComponent implements OnInit, OnDestroy {
  navItems: NavItemsModel[];
  appHeaderTitle: AppTitleModel;
  userNav: UserNavModel;
  showFindCase: boolean;
  userRoles: any;
  isCaseManager: any;
  subscription: Subscription;
  showNavItems: Observable<boolean>;

  constructor(
    private store: Store<fromActions.State>,
    private cookieService: CookieService) {
  }

  /**
   * Get User Roles
   *
   * Get User Roles from Cookie.
   */
  public getUserRoles() {

    return this.cookieService.get('roles');
  }

  /**
   * TODO:
   * Take into consideration:
   * The judicial header takes precedence over other ones for judges.
   * In other words, if a user has both judicial roles (see list below) and solicitor roles (e.g. pui-case-manager),
   * the judicial header should display.
   * @see EUI-2292
   * Therefore the array should be in priority order, with the items closer to the top taking precedence.
   *
   * We need to be prepared to add new roles and remove existing ones to the list above
   * as new services are reformed and existing ones evolve. Therefore leverage application vars.
   * @see comments on EUI-2292
   */
  public getRoleBasedThemes = () => {

    return [
      {
        roles: ['pui-case-manager'],
        appTitle: 'Case Manager',
        navigationItems: [],
        accountNavigationItems: [],
        showFindCase: true,
      },
      {
        roles: [
          'caseworker-sscs-judge',
          'caseworker-sscs-panelmember',
          'caseworker-cmc-judge',
          'caseworker-divorce-judge',
        ],
        appTitle: 'Judicial Case Manager',
        navigationItems: [],
        accountNavigationItems: [],
        showFindCase: true,
      }
    ];
  }

  /**
   * Finds the Application's Theming, based on a User's Roles.
   *
   * The application's theme contains Navigation items that the User is able to see, and styling for that User.
   * ie. To A Judicial User the application is called 'Judicial Case Manager' and has different menu items,
   * whereas to a Case Worker user the application is called 'Case Manager'.
   *
   * TODO: So do we want to go through each of our roles, or do we want to go through the User's roles
   * So it's a loop of 18 vs. 10. But if we went through the userRoles initially then if we found
   * a match it would not be prioritise if we go through our role based themes then the priority order still stands.
   *
   * We go through the roles of each theme to check if they exist for a User. We do it this way, so that we can
   * priortise which theme takes precendence, ie. a theme higher up the Role Based Theming array will take
   * precendence over one that's below it.
   *
   * @param userRoles
   * @return {boolean}
   */
  public findTheme = userRoles => {
    return false;
  }

  // Note that all components use this app-header.component.html, and therefore all components use
  // this: exui-app-header
  public ngOnInit(): void {

    this.userRoles = this.getUserRoles();
    const applicationTheme = this.findTheme(this.userRoles);
    console.log(this.userRoles);


    // So we should be able to pass in isOfRoleType(this.userRoles, 'pui-case-manager')
    // yes they are of this role type, therefore we get back the styles associated with

    // so we should getHeaderStyling
    // So we would have

    // So we get the userRoles, we then need to pick out the most appriopiate userRole.
    // This should be priority based ie. the role at the top is given the highest priority
    // and will be used firstly.

    // So if PUI case manager is part of the roles let's use this one.

    // const appNavAndStyling = getAppNavAndStyling()

    this.isCaseManager = this.getIsCaseManager(this.userRoles);

    console.log(this.isCaseManager);
    const observable = this.getObservable(this.store);
    this.subscription = this.subscribe(observable);

    // So we should be able to pass a User in, and be returned the appropiate appHeaderTitle, navItems, and
    // userNav for that User.
    // maybe we want a style object that we pass through as well.
    // So an app header configuration object is passed into app header

    // The app header changes dependent on the User.
    this.appHeaderTitle = AppConstants.APP_HEADER_TITLE;

    // I guess in the future the navItems,
    // and user nav may change dependent on the User.
    this.navItems = AppConstants.NAV_ITEMS;
    this.userNav = AppConstants.USER_NAV;
    this.showFindCase = true;
  }

  // we're doing a simple way of checking what role the User has
  // the header component is checking.
  public getIsCaseManager(userRoles: string): boolean {
    return userRoles && userRoles.indexOf('pui-case-manager') !== -1;
  }

  public getObservable(store: Store<fromActions.State>): Observable<string> {
    return store.pipe(select(fromActions.getRouterUrl));
  }

  // So over here we're subscribing to the nav items
  public subscribe(observable: Observable<string>): Subscription {
    return observable.subscribe(url => {
      this.showNavItems = of(AppUtils.showNavItems(url));
      console.log('hello nav items');
      console.log(this.showNavItems);
    });
  }

  public ngOnDestroy() {
    this.unsubscribe(this.subscription);
  }

  public unsubscribe(subscription: Subscription) {
    if (subscription) {
      subscription.unsubscribe();
    }
  }


  onNavigate(event): void {
    if (event === 'sign-out') {
      this.store.dispatch(new fromActions.StopIdleSessionTimeout());
      return this.store.dispatch(new fromActions.Logout());
    }
  }
}
