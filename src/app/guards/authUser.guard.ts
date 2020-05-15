import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthUserGuard implements CanActivate {

  constructor(private auth: AuthenticationService, private router: Router){}

  canActivate( ): boolean {
    if( this.auth.isUser() ){
      return true;
    } else {
      this.router.navigateByUrl('/login');
    }

    return this.auth.isUser();
  }

}
