import { AccessibilityComponent } from './accessibility/accessibility.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import {ExuiPageWrapperComponent} from './exui-mian-wrapper/exui-page-wrapper.component';
import { GetHelpComponent } from './get-help/get-help.component';
import {HeaderComponent} from './header/header.component';
import {HmctsGlobalFooterComponent} from './hmcts-global-footer/hmcts-global-footer.component';
import {HmctsGlobalHeaderComponent} from './hmcts-global-header/hmcts-global-header.component';
import {HmctsPrimaryNavigationComponent} from './hmcts-primary-navigation/hmcts-primary-navigation.component';
import { MediaViewerWrapperComponent } from './media-viewer-wrapper/media-viewer-wrapper.component';
import {PhaseBannerComponent} from './phase-banner/phase-banner.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { AccessibilityComponent } from './accessibility/accessibility.component';
import { MediaViewerWrapperComponent } from './media-viewer-wrapper/media-viewer-wrapper.component';
import { MediaViewerToolbarComponent } from './media-viewer-toolbar/media-viewer-toolbar.component';
import { MediaViewerSearchComponent } from './media-viewer-search/media-viewer-search.component';
import { GetHelpComponent } from './get-help/get-help.component';

export const components: any[] = [
  ExuiPageWrapperComponent,
  HmctsGlobalFooterComponent,
  HeaderComponent,
  HmctsGlobalHeaderComponent,
  HmctsPrimaryNavigationComponent,
  CookiePolicyComponent,
  PrivacyPolicyComponent,
  AccessibilityComponent,
  PhaseBannerComponent,
  ServiceDownComponent,
  MediaViewerToolbarComponent,
  MediaViewerSearchComponent,
  MediaViewerWrapperComponent,
  GetHelpComponent
];

export * from './exui-mian-wrapper/exui-page-wrapper.component';
export * from './hmcts-global-footer/hmcts-global-footer.component';
export * from './header/header.component';
export * from './hmcts-global-header/hmcts-global-header.component';
export * from './hmcts-primary-navigation/hmcts-primary-navigation.component';
export * from './phase-banner/phase-banner.component';
export * from './service-down/service-down.component';
export * from './cookie-policy/cookie-policy.component';
export * from './privacy-policy/privacy-policy.component';
export * from './accessibility/accessibility.component';
export * from './media-viewer-wrapper/media-viewer-wrapper.component';
export * from './media-viewer-toolbar/media-viewer-toolbar.component';
export * from './get-help/get-help.component';
