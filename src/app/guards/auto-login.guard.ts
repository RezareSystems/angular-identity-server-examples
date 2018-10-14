import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { filter, take, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements CanActivate {
  
  constructor(private oidcSecurityService : OidcSecurityService,
      private router: Router) { }
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      console.log('### auto login Guard hit');
      return this.oidcSecurityService.getIsAuthorized().pipe(
        take(1),
        map(isAuthorized => {
          if(!isAuthorized) {
            const goingTo = state.url.toString();
            localStorage.setItem('goingTo', goingTo);
            this.router.navigate(['login-redirect'], { skipLocationChange: true});
            return false;
          } else {
            return true;
          }
        })
      );
  }
}
