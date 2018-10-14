import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  private oidcSecurityService: OidcSecurityService;

  constructor(private injector: Injector) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(this.oidcSecurityService == null) {
      this.oidcSecurityService = this.injector.get(OidcSecurityService);
    }

    const authToken = this.oidcSecurityService.getToken();
    const authHeader = `Bearer ${authToken}`;

    const authReq = req.clone({
      setHeaders: {
        Authorization: authHeader,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    return next.handle(authReq);
  }
}
