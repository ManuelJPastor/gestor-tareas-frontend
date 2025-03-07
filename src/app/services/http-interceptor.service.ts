import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {

  /*intercept(req: HttpRequest<any>, next: HttpHandler) {
  const xhr = req.clone({
    headers: req.headers.set('X-Requested-With', 'XMLHttpRequest')
  });
  return next.handle(xhr);
}*/

    constructor(private authenticationService: AuthenticationService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authenticationService.isUserLoggedIn() && req.url.indexOf('user') === -1) {
            const authReq = req.clone({
                headers: new HttpHeaders({
                    'Authorization': `${this.authenticationService.getAuthorization()}`
                })
            });
            return next.handle(authReq);
        } else {
            return next.handle(req);
        }
    }
}
