import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../services/auth.service';
import { Location } from '@angular/common'

@Injectable({
  providedIn: 'root'
})
export class AuthAdminGuard implements CanActivate {

  constructor(private auth: AuthenticationService, private router: Router, private _location: Location){}

  canActivate( ): boolean {
      if( this.auth.isAdmin() ){
        return true;
      } else {
        this._location.back();
        Swal.fire(
          'Fallo de permisos',
          'Se necesitan los permisos de administrador para acceder.',
          'error'
        )
      }
      return this.auth.isAdmin()
  }

}
