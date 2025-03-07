import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Usuario } from 'src/app/objects/usuario';
import { Sector } from 'src/app/objects/sector';
import { Role } from 'src/app/objects/role';
import { UsuarioService } from 'src/app/services/usuario.service';
import { SectorService } from 'src/app/services/sector.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-usuarios-form',
  templateUrl: './usuarios-form.component.html',
  styleUrls: ['./usuarios-form.component.css']
})
export class UsuariosFormComponent implements OnInit {

  private usuario: Usuario = new Usuario();
  private tituloCrear:string = "Crear Usuario";
  private tituloEditar:string = "Editar Usuario";

  private errores: string[];

  private sectores: Sector[];
  private roles: Role[];

  constructor(private auth: AuthenticationService, private usuarioService: UsuarioService, private sectorService: SectorService, private router: Router, private activatedRoute: ActivatedRoute,  private _location: Location) { }

  ngOnInit() {
    this.cargarUsuario()
    this.sectorService.getSectores().subscribe(sectores => {
      this.sectores = sectores;
    });
    this.usuarioService.getRoles().subscribe(roles => {
      this.roles = roles;
    })
  }

  cargarUsuario(): void{
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.usuarioService.getUsuario(id).subscribe( usuario => {
          this.usuario = usuario
          this.usuario.password="";
        })
      }
    })
  }

  create(): void{
    this.usuarioService.create(this.usuario).subscribe(response => {
      this.router.navigate(['settings/usuarios'])
      Swal.fire('Nuevo Usuario',`${response.mensaje}: ${response.usuario.nombre}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

  update(): void{
    this.usuarioService.update(this.usuario).subscribe(response => {
      if(this.auth.isAdmin()){
        this.router.navigate(['settings/usuarios'])
      } else{
        this.router.navigate(['tareas'])
      }

      Swal.fire('Usuario Actualizado',`${response.mensaje}: ${response.usuario.nombre}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

}
