import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../services/usuario.service';
import { AuthenticationService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common'
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PerfilGuard implements CanActivate {
  constructor(private usuarioService: UsuarioService, private auth: AuthenticationService, private _location: Location){}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.isProfileOwner(next.params.id);
  }

  isProfileOwner(id): Observable<boolean> {

    return this.usuarioService.getUsuariosByEmail(this.auth.getLoggedInUserName()).pipe(
      map(usuario => {

      if( this.auth.isAdmin() || usuario.id==id){
         return true;
      } else {
        this._location.back();
        Swal.fire(
          'Fallo de permisos',
          'Se necesita ser participante en la tarea para acceder.',
          'error'
        )
        return false;
      }
    }))
  }
}
