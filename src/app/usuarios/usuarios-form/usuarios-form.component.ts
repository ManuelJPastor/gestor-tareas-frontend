import { Component, OnInit } from '@angular/core';
import { Usuario } from '../usuario';
import { UsuarioService } from '../usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

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

  private sectores: string[];

  constructor(private usuarioService: UsuarioService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarCliente()

    this.usuarioService.getSectores().subscribe(
      sectores => this.sectores = sectores

    );
  }

  cargarCliente(): void{
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.usuarioService.getUsuario(id).subscribe( usuario => this.usuario = usuario)
      }
    })
  }

  create(): void{
    this.usuarioService.create(this.usuario).subscribe(response => {
      this.router.navigate(['/usuarios'])
      Swal.fire('Nuevo Usuario',`${response.mensaje}: ${response.usuario.nombre}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

  update(): void{
    this.usuarioService.update(this.usuario).subscribe(response => {
      this.router.navigate(['usuarios'])
      Swal.fire('Usuario Actualizado',`${response.mensaje}: ${response.usuario.nombre}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

}
