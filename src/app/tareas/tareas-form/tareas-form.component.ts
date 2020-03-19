import { Component, OnInit } from '@angular/core';
import { Tarea } from '../tarea';
import { TareaService } from '../tarea.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SectorService } from 'src/app/settings/sectores/sector.service';
import { Sector } from 'src/app/settings/sectores/sector';

@Component({
  selector: 'app-tareas-form',
  templateUrl: './tareas-form.component.html',
  styleUrls: ['./tareas-form.component.css']
})
export class TareasFormComponent implements OnInit {

  private tituloCrear:string = "Crear Tarea";
  private tituloEditar:string = "Editar Tarea";
  private tarea: Tarea = new Tarea();

  private isTareaPadre: boolean = false;

  private errores: string[];

  private sectores: Sector[];
  private tareasPadre: Tarea[];

  constructor(private tareaService: TareaService, private sectorService: SectorService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.tarea.tareaPadre = new Tarea();
    this.cargarTarea();
    this.sectorService.getSectores().subscribe(sectores => this.sectores = sectores);
    this.tareaService.getTareasPadre().subscribe(tareas => {
      this.tareasPadre = tareas;
      this.tareasPadre = this.tareasPadre.filter(tareaPadre => tareaPadre.id != this.tarea.id)
    });
  }

  checkboxTareaPadre(): void{
    this.isTareaPadre = !this.isTareaPadre;
    if(!this.isTareaPadre){
      this.tarea.tareaPadre=new Tarea();
    } else{
      this.tarea.tareaPadre = null;
    }
  }

  cargarTarea(): void{
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.tareaService.getTarea(id).subscribe( tarea => {
          this.tarea = tarea;
          if(this.tarea.tareaPadre==null){
            this.isTareaPadre = true;
          }
        })
      }
    })
  }

  completarJsonTarea(): void{
    this.tarea.tareaPadre = this.tareasPadre.find(tareaPadre => tareaPadre.id == this.tarea.tareaPadre.id);
    this.tarea.sector = this.tarea.tareaPadre.sector;
  }

  create(): void{
    this.completarJsonTarea()
    this.tareaService.create(this.tarea).subscribe(response => {
      this.router.navigate(['/tareas'])
      Swal.fire('Nueva Tarea',`${response.mensaje}: ${response.tarea.titulo}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

  update(): void{
    this.completarJsonTarea()
    this.tareaService.update(this.tarea).subscribe(response => {
      this.router.navigate(['tareas'])
      Swal.fire('Tarea Actualizada',`${response.mensaje}: ${response.tarea.titulo}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    }
    );
  }

}
