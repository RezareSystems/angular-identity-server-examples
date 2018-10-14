import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map, filter, mergeMap } from 'rxjs/operators';
import { UserProfileService } from '../services/user-profile.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root'
})
export class PermissionsGuard implements CanActivate {

  constructor(private userService: UserProfileService,
      private oidcSecurityService: OidcSecurityService,
      private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      console.log('### permissions hit');
      return this.oidcSecurityService.getIsAuthorized().pipe(
        filter(isAuthorized => isAuthorized),
        take(1),
        mergeMap(isAuthorized => this.userService.loadUserProfile()),
        map(userProfile => {
          if(userProfile != null) {
            const userPermissions = userProfile.permissions.map(p => p.key);
            const requiredPermissions: string[] = next.data['permissions'];
            for (let i = 0; i < requiredPermissions.length; i++) {
              const currentPermission = requiredPermissions[i];
              if (userPermissions.indexOf(currentPermission) === -1) {
                this.router.navigate(['forbidden']);
                return false;
              }
            }
            return true;
          }
        })
      );
  }
}
