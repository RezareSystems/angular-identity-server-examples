import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  OidcSecurityService,
  AuthorizationResult
} from "angular-auth-oidc-client";
import { Subscription, Observable } from "rxjs";
import { filter, take, mergeMap } from "rxjs/operators";
import { Router } from "@angular/router";
import { UserProfileService } from "./services/user-profile.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnDestroy, OnInit {
  title = "ids6012test";
  isAuthorized$: Observable<boolean>;
  subscriptions: Subscription[] = [];
  _moduleSetup: boolean;
  userData$: Observable<any>;

  get moduleSetup() {
    return this._moduleSetup;
  }
  set moduleSetup(value: boolean) {
    if (this._moduleSetup == null && value) {
      console.log("### Module initialized");
    }
    this._moduleSetup = value;
  }

  constructor(
    private oidcSecurityService: OidcSecurityService,
    private router: Router,
    private userService: UserProfileService
  ) {
    this.oidcSecurityService
      .getIsModuleSetup()
      .pipe(
        filter((isModuleSetup: boolean) => isModuleSetup),
        take(1)
      )
      .subscribe((isModuleSetup: boolean) => {
        this.moduleSetup = true;
        this.doCallbackLogicIfRequired();
      });

    this.subscriptions.push(
      this.oidcSecurityService.onAuthorizationResult.subscribe(
        this.onAuthorizationResult.bind(this)));
    this.subscriptions.push(
      this.oidcSecurityService.onCheckSessionChanged.pipe(mergeMap(() => this.oidcSecurityService.getIsAuthorized()), take(1)).subscribe(
        this.onCheckSessionChanged.bind(this)));  
  }

  ngOnInit() {
    this.isAuthorized$ = this.oidcSecurityService.getIsAuthorized();
    this.userData$ = this.oidcSecurityService.getUserData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  login() {
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff();
  }

  private onAuthorizationResult(authorizationResult: AuthorizationResult) {
    if (authorizationResult === AuthorizationResult.authorized) {
      this.userService.loadUserProfile().subscribe(() => {
        const fromSilentRenew = localStorage.getItem("fromSilentRenew");
        if (fromSilentRenew == null) {
          console.log("### onAuthorizationResult after login");
          this.redirectToGoingTo();
        } else if (fromSilentRenew == "true") {
          console.log("### onAuthorizationResult after silent_renew");
        }
        localStorage.removeItem("fromSilentRenew");
      });
    } else {
      localStorage.removeItem("fromSilentRenew");
    }
  }

  private onCheckSessionChanged(isAuthorized: boolean) {
    console.log('### onCheckSessionChanged', isAuthorized);
    if(isAuthorized) {
      if (window.parent) {
        // Need to re-route like this because this event is sent from the check session iframe
        window.parent.location.href = '/logout-redirect';
      }
    }
  }

  private doCallbackLogicIfRequired() {
    if (window.location.hash && window.location.hash.indexOf("id_token") > -1) {
      this.oidcSecurityService.authorizedCallback();
    }
  }

  private redirectToGoingTo() {
    const goingTo = localStorage.getItem("goingTo") || 'home';
    localStorage.removeItem("goingTo");
    if (goingTo) {
      this.router.navigateByUrl(goingTo);
    }
  }
}
