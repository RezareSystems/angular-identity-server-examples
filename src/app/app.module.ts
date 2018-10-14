import { BrowserModule } from "@angular/platform-browser";
import { NgModule, APP_INITIALIZER } from "@angular/core";
import {
  OidcConfigService,
  AuthModule,
  OidcSecurityService,
  OpenIDImplicitFlowConfiguration,
  AuthWellKnownEndpoints
} from "angular-auth-oidc-client";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { RouterModule, Routes } from "@angular/router";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { AutoLoginGuard } from "./guards/auto-login.guard";
import { SecuredComponent } from "./secured/secured.component";
import { LoginRedirectComponent } from "./login-redirect/login-redirect.component";
import { LogoutRedirectComponent } from "./logout-redirect/logout-redirect.component";
import { UserProfileService } from "./services/user-profile.service";
import { AuthInterceptorService } from "./interceptors/auth-interceptor.service";
import { ForbiddenComponent } from "./forbidden/forbidden.component";
import { PermissionsGuard } from "./guards/permissions.guard";

export function loadConfig(oidcConfigService: OidcConfigService) {
  return () => {
    return oidcConfigService.load_using_stsServer("https://localhost:44345");
  };
}

const routes: Routes = [
  { path: "home", component: HomeComponent },
  {
    path: "secured",
    component: SecuredComponent,
    canActivate: [AutoLoginGuard, PermissionsGuard],
    data: {
      permissions: ["AU001"]
    }
  },
  { path: "login-redirect", component: LoginRedirectComponent },
  { path: "logout-redirect", component: LogoutRedirectComponent },
  { path: "forbidden", component: ForbiddenComponent },
  { path: "", pathMatch: "full", redirectTo: "home" }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SecuredComponent,
    LoginRedirectComponent,
    LogoutRedirectComponent,
    ForbiddenComponent
  ],
  imports: [
    BrowserModule,
    AuthModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      deps: [OidcConfigService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    AutoLoginGuard,
    PermissionsGuard,
    UserProfileService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private oidcSecurityService: OidcSecurityService,
    private oidcConfigService: OidcConfigService
  ) {
    this.oidcConfigService.onConfigurationLoaded.subscribe(() => {
      const openIDConfig = new OpenIDImplicitFlowConfiguration();
      openIDConfig.stsServer = "https://localhost:44345";
      openIDConfig.redirect_url = "http://localhost:4202";
      openIDConfig.client_id = "Rtp.Bidr.Auction.Ng";
      openIDConfig.response_type = "id_token token";
      openIDConfig.scope =
        "openid email profile role api.write api.read offline_access";
      openIDConfig.post_logout_redirect_uri = "http://localhost:4202";
      openIDConfig.start_checksession = true;
      openIDConfig.silent_renew = true;
      openIDConfig.silent_renew_url = "http://localhost:4202/silent_renew.html";
      openIDConfig.post_login_route = "/home";
      openIDConfig.forbidden_route = "/forbidden";
      openIDConfig.unauthorized_route = "/unauthorized";
      openIDConfig.log_console_debug_active = true;
      openIDConfig.log_console_warning_active = true;
      openIDConfig.max_id_token_iat_offset_allowed_in_seconds = 90;
      openIDConfig.storage = localStorage;
      openIDConfig.trigger_authorization_result_event = true;

      const authWellKnownEndpoints = new AuthWellKnownEndpoints();
      authWellKnownEndpoints.setWellKnownEndpoints(
        this.oidcConfigService.wellKnownEndpoints
      );
      this.oidcSecurityService.setupModule(
        openIDConfig,
        authWellKnownEndpoints
      );
    });
  }
}
