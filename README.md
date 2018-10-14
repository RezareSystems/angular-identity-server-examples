# Identity Server Angular 6 Client Example
###### This example shows how to set up an identity server Angular 6 application client using the [angular-auth-oidc-client](https://www.npmjs.com/package/angular-auth-oidc-client) (using version 6.0.12 as of latest commit)

Includes:
- Basic set up
- Setting up auth interceptors for attaching bearer tokens to request
- Adding guards for auto-login
- Adding auto-logout functionality when session ends
- Guards for checking permissions chained with API call

#### Note: This does not include an Identity server project yet. You would need to run your own with client configurations added for this application and then change the values and STS URLs on the set up in the `app.module.ts` file:
```
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

```
#### Note: The UserProfile Service is application specific. You can replace the API call there with an API of your own that uses OAuth for Authentication
