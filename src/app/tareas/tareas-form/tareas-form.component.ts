import { Component, OnInit } from '@angular/core';
import { Tarea } from '../tarea';
import { TareaService } from '../tarea.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tareas-form',
  templateUrl: './tareas-form.component.html',
  styleUrls: ['./tareas-form.component.css']
})
export class TareasFormComponent implements OnInit {

  private tarea: Tarea = new Tarea();
  private tituloCrear:string = "Crear Tarea";
  private tituloEditar:string = "Editar Tarea";

  private errores: string[];

  private estados: string[];

  constructor(private tareaService: TareaService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarCliente()

    this.tareaService.getEstados().subscribe(
      estados => this.estados = estados

    );
  }

  cargarCliente(): void{
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.tareaService.getTarea(id).subscribe( tarea => this.tarea = tarea)
      }
    })
  }

  create(): void{
    this.tareaService.create(this.tarea).subscribe(response => {
      this.router.navigate(['/tareas'])
      Swal.fire('Nueva Tarea',`${response.mensaje}: ${response.tarea.titulo}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

  update(): void{
    this.tareaService.update(this.tarea).subscribe(response => {
      this.router.navigate(['tareas'])
      Swal.fire('Tarea Actualizada',`${response.mensaje}: ${response.tarea.titulo}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

}
