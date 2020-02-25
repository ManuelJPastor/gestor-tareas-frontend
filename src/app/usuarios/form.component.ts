import { Component, OnInit } from '@angular/core';
import { Usuario } from './usuario';
import { UsuarioService } from './usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2'

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  private usuario: Usuario = new Usuario();
  private tituloCrear:string = "Crear Usuario";
  private tituloEditar:string = "Editar Usuario";

  private errores: string[];

  constructor(private usuarioService: UsuarioService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarCliente()
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
      swal.fire('Nuevo Usuario',`${response.mensaje}: ${response.usuario.nombre}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

  update(): void{
    this.usuarioService.update(this.usuario).subscribe(response => {
      this.router.navigate(['usuarios'])
      swal.fire('Usuario Actualizado',`${response.mensaje}: ${response.usuario.nombre}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

}
