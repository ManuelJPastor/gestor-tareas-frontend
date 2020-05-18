import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { Tarea } from 'src/app/objects/tarea';
import { TareaService } from 'src/app/services/tarea.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.component.html',
  styleUrls: ['./tareas.component.css']
})
export class TareasComponent implements OnInit {

  mostrarTodas: boolean = false;

  tareas: Tarea[] = new Array<Tarea>();

  page_number: number = 1;
  page_size: number = 10;
  pageSizeOptions = [5, 10, 20, 50, 100];

  handlePage(e: PageEvent){
    this.page_size = e.pageSize
    this.page_number=e.pageIndex + 1
  }

  constructor(private tareaService: TareaService, private usuarioService: UsuarioService, private authService: AuthenticationService) { }

  ngOnInit() {
    this.tareaService.getMisTareas(this.authService.getLoggedInUserName()).subscribe(misTareas => {
      this.tareas = misTareas;
    })
  }

  mostrarTareas(): void{
    this.mostrarTodas=!this.mostrarTodas;
    if(!this.mostrarTodas){
      this.tareaService.getMisTareas(this.authService.getLoggedInUserName()).subscribe(misTareas => {
        this.tareas = misTareas;
      },
      err => { this.tareas = [] })
    } else{
      this.tareaService.getTareas().subscribe(tareas => {
        this.tareas = tareas;
      },
      err => { this.tareas = [] })
    }

  }

  /*ordenar(): void{
    this.tareas.sort((a,b) => b.nombre.localeCompare(a.nombre));
  }*/

  delete(tarea: Tarea): void {
    Swal.fire({
      title: '¿Estas seguro?',
      text: `¿Desea eliminar la tarea ${tarea.titulo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '!Sí, elimínalo!'
    }).then((result) => {
      if (result.value) {
        this.tareaService.delete(tarea.id).subscribe( response => {
          this.tareaService.getTareas().subscribe(tareas => this.tareas = tareas)
          Swal.fire(
            '¡Eliminada!',
            'La tarea ha sido borrada.',
            'success'
          )
        })
      }
    })
  }

}
