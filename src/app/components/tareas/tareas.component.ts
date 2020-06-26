import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { Tarea } from 'src/app/objects/tarea';
import { TareaService } from 'src/app/services/tarea.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.component.html',
  styleUrls: ['./tareas.component.css']
})
export class TareasComponent implements OnInit {

  sortAscFecha: boolean = true;

  mostrarTodas: boolean = false;

  tareasAll: Tarea[] = new Array<Tarea>();
  tareas: Tarea[] = new Array<Tarea>();

  page_number: number = 1;
  page_size: number = 10;
  pageSizeOptions = [5, 10, 20, 50, 100];

  handlePage(e: PageEvent){
    this.page_size = e.pageSize
    this.page_number=e.pageIndex + 1
  }

  constructor(private tareaService: TareaService, private usuarioService: UsuarioService, private authService: AuthenticationService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.mostrarTareas(this.mostrarTodas);
  }

  busqueda(){
    var busqueda = document.getElementById("busqueda").value;
    var estado = document.getElementById("estado").value;
    this.tareas = this.tareasAll.filter(tarea => tarea.titulo.toLowerCase().includes(busqueda.toLowerCase())|| tarea.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    if(estado!="Todos"){
      this.tareas = this.tareas.filter(tarea => tarea.estado == estado);
    }
  }

  ordenarFecha(): void{
    var ordenadas;
    if(this.sortAscFecha){
      ordenadas = this.tareas.sort((a, b) => {
        if(a.fechaMax < b.fechaMax){
          return 1
        } else{
          return -1
        }
      });
      this.tareas = [];
      this.cdr.detectChanges();
      this.tareas = ordenadas;
      this.sortAscFecha = false;

    } else{
      ordenadas = this.tareas.sort((a, b) => {
        if(a.fechaMax > b.fechaMax){
          return 1
        } else{
          return -1
        }
      });
      this.tareas = [];
      this.cdr.detectChanges();
      this.tareas = ordenadas;
      this.sortAscFecha = true;
    }
  }

  mostrarTareas(mostrarTodas: boolean): void{
    this.mostrarTodas = mostrarTodas;
    if(!this.mostrarTodas){
      this.tareaService.getMisTareas(this.authService.getLoggedInUserName()).subscribe(misTareas => {
        this.tareas = misTareas.sort((a, b) => {
          if(a.fechaMax > b.fechaMax){
            return 1
          } else{
            return -1
          }
        });
        this.tareasAll = this.tareas;
      },
      err => { this.tareas = [] })
    } else{
      this.tareaService.getTareas().subscribe(tareas => {
        this.tareas = tareas.sort((a, b) => {
          if(a.fechaMax > b.fechaMax){
            return 1
          } else{
            return -1
          }
        });
        this.tareasAll = this.tareas;
      },
      err => { this.tareas = [] })
    }
    this.sortAscFecha = true;
  }





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
          this.mostrarTareas(this.mostrarTodas)
          Swal.fire(
            '¡Eliminada!',
            'La tarea ha sido borrada.',
            'success'
          )
        })
      }
    })
  }

  async guardarPlantilla(tarea: Tarea): Promise<void>{

    const { value: tituloPlantilla } = await Swal.fire({
      title: 'Introduce el nombre de la plantilla',
      input: 'text',
      inputValue: tarea.titulo,
      showCancelButton: true,
    })

    this.tareaService.guardarPlantilla(tarea, tituloPlantilla).subscribe(response => {
      Swal.fire('Plantilla Creada', response.mensaje, 'success');
    })

  }

}
