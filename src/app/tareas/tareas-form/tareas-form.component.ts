import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Tarea } from '../tarea';
import { TareaService } from '../tarea.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SectorService } from 'src/app/settings/sectores/sector.service';
import { Sector } from 'src/app/settings/sectores/sector';
import * as $ from 'jquery';
import { NzFormatEmitEvent, NzTreeNodeOptions, NzTreeNode} from 'ng-zorro-antd/tree/public-api';

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

  private tareasPadre: Tarea[];
  private tarea: Tarea = new Tarea();
  private sectores: Sector[];

  private nodesTareas: NzTreeNodeOptions[] = [];
  private tareaPadreId: string;
  private tareasPrecedentesIds: string[];


  constructor(private tareaService: TareaService, private sectorService: SectorService, private router: Router, private activatedRoute: ActivatedRoute) { }


  ngOnInit() {
    this.cargarTarea();
  }

  cargarTarea(): void{
    this.tarea.tareaPadre = new Tarea();
    this.sectorService.getSectores().subscribe(sectores => this.sectores = sectores);
    this.tareaService.getTareasPadre().subscribe(tareasPadre => {
      this.tareasPadre = tareasPadre;
      this.tareasPadre.forEach(tarea => {
        var node = {key: tarea.id.toString(), title: tarea.titulo, isLeaf: false};
        this.tareaService.getSubTareas(tarea.id).subscribe(subTareas => {
          if(subTareas.length==0){
            node.isLeaf = true;
          }
          this.nodesTareas.push(node);
        })

      })

      this.activatedRoute.params.subscribe(params => {
        let id = params['id']
        if(id){
          this.tareaService.getTarea(id).subscribe( tarea => {
            this.tarea = tarea;
            this.tareaPadreId = this.tarea.tareaPadre.id.toString()
            if(this.tarea.tareaPadre==null){
              this.tarea.tareaPadre=new Tarea();
              this.tarea.tareaPadre.id = null;
            }
          })
        }
      })
    });
  }

  selectTareaPadre(id: number): void {
    if(id!=null){
      this.tareaService.getTarea(id).subscribe(tarea=>{
        this.tarea.tareaPadre = tarea
      })
    }
  }

  onExpandChange(e: NzFormatEmitEvent, id: string): void {
    const node = e.node;
    if(node.getChildren().length==0){
      this.tareaService.getSubTareas(node.key).subscribe(subTareas => {
        if(subTareas.length != 0){
          subTareas.forEach(subTarea => {
            this.tareaService.getSubTareas(subTarea.id).subscribe(subTareasSubTarea => {
              if(subTareasSubTarea.length==0){
                node.addChildren([{key: subTarea.id.toString() ,title: subTarea.titulo, isLeaf: true}])
              } else{
                node.addChildren([{key: subTarea.id.toString() ,title: subTarea.titulo, isLeaf: false}])
              }
              document.getElementById(id).click();
              document.getElementById(id).click();
            })
          })

        }
      })
    }
  }

  completarJsonTarea(): void{
    if(this.tarea.tareaPadre.id==null){
      this.tarea.tareaPadre=null;
    }else{
      this.tareaService.getTarea(this.tarea.tareaPadre.id).subscribe(tareaPadre => {
      this.tarea.tareaPadre = tareaPadre;
      })
    }
    //this.completarTareasPrecedentes();
  }

  /*completarTareasPrecedentes(): void{
    this.tarea.tareasPrecedentes.forEach((tareaPrecedente, index) => {
      this.tareaService.getTarea(this.tarea.tareasPrecedentes[index].id).subscribe(tareaPrecedente => {
        this.tarea.tareasPrecedentes[index] = tareaPrecedente
      })
    });
  }*/

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
