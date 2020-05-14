import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../login/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthAdminGuard implements CanActivate {

  constructor(private auth: AuthenticationService, private router: Router){}

  canActivate( ): boolean {
      if( this.auth.isAdmin() ){
        return true;
      } else {
        Swal.fire(
          'Fallo de permisos',
          'Se necesitan los permisos de administrador para acceder.',
          'error'
        )
      }
      return this.auth.isAdmin()
  }

}
