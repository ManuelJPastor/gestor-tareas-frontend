import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Tarea } from 'src/app/objects/tarea';
import { PageEvent } from '@angular/material/paginator';
import { TareaService } from 'src/app/services/tarea.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plantillas',
  templateUrl: './plantillas.component.html',
  styleUrls: ['./plantillas.component.css']
})
export class PlantillasComponent implements OnInit {

  sortAscFecha: boolean = true;

  plantillasAll: Tarea[] = new Array<Tarea>();
  plantillas: Tarea[] = new Array<Tarea>();

  page_number: number = 1;
  page_size: number = 10;
  pageSizeOptions = [5, 10, 20, 50, 100];

  handlePage(e: PageEvent){
    this.page_size = e.pageSize
    this.page_number=e.pageIndex + 1
  }

  constructor(private tareaService: TareaService, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
    this.cargarPlantillas();
  }

  busqueda(){
    var busqueda = document.getElementById("busqueda").value;
    this.plantillas = this.plantillasAll.filter(tarea => tarea.titulo.toLowerCase().includes(busqueda.toLowerCase())|| tarea.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
  }

  ordenarFecha(): void{
    var ordenadas;
    if(this.sortAscFecha){
      ordenadas = this.plantillas.sort((a, b) => {
        if(a.fechaMax < b.fechaMax){
          return 1
        } else{
          return -1
        }
      });
      this.plantillas = [];
      this.cdr.detectChanges();
      this.plantillas = ordenadas;
      this.sortAscFecha = false;

    } else{
      ordenadas = this.plantillas.sort((a, b) => {
        if(a.fechaMax > b.fechaMax){
          return 1
        } else{
          return -1
        }
      });
      this.plantillas = [];
      this.cdr.detectChanges();
      this.plantillas = ordenadas;
      this.sortAscFecha = true;
    }
  }

  cargarPlantillas(): void{
    this.tareaService.getPlantillas().subscribe(plantillas => {
      this.plantillas = plantillas.sort((a, b) => {
        if(a.fechaMax > b.fechaMax){
          return 1
        } else{
          return -1
        }
      });
      this.plantillasAll = this.plantillas;
    },
    err => { this.plantillas = [] })
    this.sortAscFecha = true;
  }

  eliminarPlantilla(plantilla: Tarea): void{
    this.tareaService.eliminarPlantilla(plantilla.id).subscribe(response => {
      this.cargarPlantillas()
    })
  }

  async usarPlantilla(plantilla: Tarea): Promise<void>{
    const { value: tituloTareaPadre } = await Swal.fire({
      title: 'Introduce el nombre de la tarea padre',
      input: 'text',
      inputValue: plantilla.titulo,
      showCancelButton: true,
    })
    if(tituloTareaPadre){
      this.tareaService.usarPlantilla(plantilla.id, tituloTareaPadre).subscribe(response => {
        Swal.fire('Tareas Creadas',`${response.mensaje}`, 'success')
        this.router.navigate(['/tareas/rama/', response.tarea.id])
      })
    }



  }

}
