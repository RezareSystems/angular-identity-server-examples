import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HttpClient } from '@angular/common/http';
import { take, mergeMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private oidcSecurityService: OidcSecurityService, private http: HttpClient) { }

  loadUserProfile(): Observable<any> {
    if(this.currentUserSubject.value == null) {
      console.log('### loading user profile');
      return this.oidcSecurityService.getUserData().pipe(
        take(1),
        mergeMap(userData => this.getUserProfile(userData.sub)),
        tap(userProfile => { this.currentUserSubject.next(userProfile)})
      )
    } else {
      console.log('### user profile already loaded');
      const userProfile = this.currentUserSubject.value;
      return of(userProfile);
    }
  }

  private getUserProfile(subjectId: string) {
    return this.http.get<any>(`https://localhost:44398/userprofiles/${subjectId}`);
  }
}
