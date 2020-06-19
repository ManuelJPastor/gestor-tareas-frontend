import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/auth.service';
import { TareaService } from '../services/tarea.service';
import { UsuarioService } from '../services/usuario.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common'

@Injectable({
  providedIn: 'root'
})
export class ParticipanteGuard implements CanActivate {

  constructor(private tareaService: TareaService, private auth: AuthenticationService, private _location: Location){}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    this.tareaService.getMisTareas(this.auth.getLoggedInUserName()).subscribe(tareas => {
      if(tareas.find(tarea => tarea.id == next.params.id) || this.auth.isAdmin()){
        return true;
      }else{
        this._location.back();
        Swal.fire(
          'Fallo de permisos',
          'Se necesita ser participante en la tarea para acceder.',
          'error'
        )
        return false;
      }
    })
    return true;

  }

}
