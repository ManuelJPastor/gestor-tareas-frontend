import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Tarea } from '../tarea';
import { TareaService } from '../tarea.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SectorService } from 'src/app/settings/sectores/sector.service';
import { Sector } from 'src/app/settings/sectores/sector';

@Component({
  selector: 'app-tareas-form',
  templateUrl: './tareas-form.component.html',
  styleUrls: ['./tareas-form.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TareasFormComponent implements OnInit {

  private tituloCrear:string = "Crear Tarea";
  private tituloEditar:string = "Editar Tarea";
  private errores: string[];

  private tarea: Tarea = new Tarea();
  private sectores: Sector[];
  private tareasPadre: Tarea[];

  private ramaTareas: Tarea[] = [];
  private dropdownSettings:any = {};

  private idsExclusion: number[];
  private tareasPrecedentes: Tarea[] = [];


  constructor(private tareaService: TareaService, private sectorService: SectorService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.tarea.tareaPadre = new Tarea();
    this.cargarTarea();
    this.sectorService.getSectores().subscribe(sectores => this.sectores = sectores);
    this.tareaService.getTareasPadre().subscribe(tareas => {
      this.tareasPadre = tareas;
      this.tareasPadre = this.tareasPadre.filter(tareaPadre => tareaPadre.id != this.tarea.id)
    });
    this.tareaService.getTareas().subscribe(tareas => {this.ramaTareas = tareas, this.actualizarTareasPrecedentes()});

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'titulo',
      enableCheckAll: false,
      itemsShowLimit: 3,
      allowSearchFilter: true,
      searchPlaceholderText: 'Buscar aquí..',
      maxHeight: 150
    }
  }

  onTareaSelect(tarea: Tarea){
    this.actualizarTareasPrecedentes();
    console.log('onItemSelect', this.tarea);
  }

  onItemDeSelect(tarea: any){
    this.actualizarTareasPrecedentes();
  }

  onDropDownClose(){
  }


  actualizarTareasPrecedentes(): void{
    this.completarTareasPrecedentes();
    this.idsExclusion=[]
    this.tarea.tareasPrecedentes.forEach( tareaPrecedente => {
      this.obtenerIdsExclusion(tareaPrecedente);
    })
    this.tareasPrecedentes = this.ramaTareas.filter(tarea=>!this.idsExclusion.includes(tarea.id));

    let tareasExclusion: Tarea[] = [];
    this.tarea.tareasPrecedentes.forEach( tareaPrecedente => {
      console.log("tareaPrecedente",tareaPrecedente.id)
      if(this.idsExclusion.includes(tareaPrecedente.id)){
        tareasExclusion.push(tareaPrecedente)
      }
    })
    tareasExclusion.forEach(tarea => {
      this.tarea.tareasPrecedentes.splice(this.tarea.tareasPrecedentes.indexOf(tarea), 1);
    })


  }

  obtenerIdsExclusion(tarea:Tarea): void{
    tarea.tareasPrecedentes.forEach(tareaPrecedente => {
      if(tareaPrecedente.tareasPrecedentes.length!=0){
        this.obtenerIdsExclusion(tareaPrecedente)
      }
      this.idsExclusion.push(tareaPrecedente.id);
    })


  }

  /*comprobarTareasPrecedentes(): void {
    this.tarea.tareasPrecedentes.forEach(tareaActual => {
      this.tarea.tareasPrecedentes.filter(tareaExcluyente => tareaExcluyente.id!=tareaActual.id)
        .forEach(tareaBusqueda => {
          if(tareaBusqueda.tareasPrecedentes.length!=0){
            if(this.buscarConflictoTareasPrecedentes(tareaActual, tareaBusqueda)){
              this.tarea.tareasPrecedentes.splice(this.tarea.tareasPrecedentes.indexOf(tareaActual), 1);
            }
          }
        })
    })
  }

  buscarConflictoTareasPrecedentes(tareaActual: Tarea, tareaBusqueda: Tarea): boolean{
    let conflicto:boolean=false;
    tareaBusqueda.tareasPrecedentes.forEach(tareaPrecedente => {
      if(tareaPrecedente.tareasPrecedentes.length!=0){
        if(this.buscarConflictoTareasPrecedentes(tareaActual, tareaPrecedente)){
          conflicto=true;
        }
      }
      if(tareaPrecedente.id==tareaActual.id){
        conflicto=true;
      }
    })
    return conflicto;
  }*/

  completarJsonTarea(): void{
    if(this.tarea.tareaPadre.id==null){
      this.tarea.tareaPadre=null;
      this.tarea.sector=null;
    }else{
      this.tarea.tareaPadre = this.tareasPadre.find(tareaPadre => tareaPadre.id == this.tarea.tareaPadre.id);
    }
    this.completarTareasPrecedentes();
  }

  completarTareasPrecedentes(): void{
    let ids : Array<Number> = [];
    this.tarea.tareasPrecedentes.forEach(tareaPrecedente => ids.push(tareaPrecedente.id));
    this.tarea.tareasPrecedentes = this.ramaTareas.filter(tarea => ids.includes(tarea.id));
  }

  cargarTarea(): void{
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.tareaService.getTarea(id).subscribe( tarea => {
          this.tarea = tarea;
        })
      }
    })
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
