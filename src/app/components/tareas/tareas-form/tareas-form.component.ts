import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as $ from 'jquery';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Tarea } from 'src/app/objects/tarea';
import { Sector } from 'src/app/objects/sector';
import { Usuario } from 'src/app/objects/usuario';
import { TareaService } from 'src/app/services/tarea.service';
import { SectorService } from 'src/app/services/sector.service';
import { UsuarioService } from 'src/app/services/usuario.service';

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

  private tareasPadre: Tarea[] =  new Array<Tarea>();
  private tarea: Tarea = new Tarea();
  private sectores: Sector[];
  private usuarios: Usuario[];

  private usuariosSettings: IDropdownSettings;
  private actoresSettings: IDropdownSettings;

  private hasSubTareas:Boolean = false;


  constructor(private tareaService: TareaService, private sectorService: SectorService, private usuarioService: UsuarioService, private router: Router, private activatedRoute: ActivatedRoute) { }


  ngOnInit() {
    this.cargarTarea();
    this.sectorService.getSectores().subscribe(sectores => {
      this.sectores = sectores;
    });
    this.usuarioService.getUsuarios().subscribe(usuarios => {
      this.usuarios = usuarios
    })

    this.usuariosSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'nombre',
      selectAllText: 'Seleccionar todos',
      unSelectAllText: 'Deseleccionar todos',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      searchPlaceholderText: 'Buscar por nombre',
      noDataAvailablePlaceholderText: 'No existen usuarios'
    };

    this.actoresSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'nombre',
      selectAllText: 'Seleccionar todos',
      unSelectAllText: 'Deseleccionar todos',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      searchPlaceholderText: 'Buscar por nombre',
      noDataAvailablePlaceholderText: 'No existen actores'
    };

  }

  cargarTarea(): void{
    this.tarea.tareaPadre = new Tarea();

    this.tareaService.getTareasPadre().subscribe(tareasPadre => {

      tareasPadre.forEach(tareaPadre => {
        this.recorrerSubtareas(tareaPadre)
      })

      setTimeout( () => {
        this.tareasPadre = tareasPadre
      }, 1500 );

      this.activatedRoute.params.subscribe(params => {
        let id = params['id']
        if(id){
          this.tareaService.getTarea(id).subscribe( tarea => {

            this.tarea = tarea;
            this.tarea.sector.actores = this.tarea.sector.actores.filter(actor => !actor.encargado)
            this.tareaService.getSubTareas(this.tarea.id).subscribe(subTareas => {
              if(subTareas.length==0){
                this.hasSubTareas = false;
              } else{
                subTareas.forEach(subTarea => {
                  if(subTarea.estado!="Finalizada"){
                    this.hasSubTareas = true;
                  }
                })

              }
            })
            if(this.tarea.tareaPadre==null){
              this.tarea.tareaPadre=new Tarea();
              this.tarea.tareaPadre.id = null;
            }
          })
        }
      })
    });

  }

  recorrerSubtareas(tarea: Tarea){
    tarea.subTareas = new Array<Tarea>()
    this.tareaService.getSubTareas(tarea.id).subscribe(subTareas => {
      subTareas.forEach(subTarea => {
        this.recorrerSubtareas(subTarea)
        tarea.subTareas.push(subTarea)
      })
    })
  }

  selectTareaPadre(id: number): void {
    if(id!=null){
      this.tareaService.getTarea(id).subscribe(tarea=>{
        this.tarea.tareaPadre = tarea
      })
    }
  }

  /*onExpandChange(e: NzFormatEmitEvent, id: string): void {
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
  }*/

  completarJsonTarea(): void{
    if(this.tarea.tareaPadre.id==null){
      this.tarea.tareaPadre=null;
    }else{
      this.tareaService.getTarea(this.tarea.tareaPadre.id).subscribe(tareaPadre => {
      this.tarea.tareaPadre = tareaPadre;
      })
    }

    this.tarea.usuarios.forEach((usuario, index) => {
      this.usuarioService.getUsuario(usuario.id).subscribe(usuarioCompleto => {
        this.tarea.usuarios[index] = usuarioCompleto;
      })
    })
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

    });
    if(this.tarea.tareaPadre==null){
      this.tarea.tareaPadre = new Tarea();
    }

  }

  update(): void{
    this.completarJsonTarea()
    this.tareaService.update(this.tarea).subscribe(response => {
      this.router.navigate(['/tareas'])
      Swal.fire('Tarea Actualizada',`${response.mensaje}: ${response.tarea.titulo}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];

    });
    if(this.tarea.tareaPadre==null){
      this.tarea.tareaPadre = new Tarea();
    }
  }

  empezarTarea(): void{
    this.tarea.estado = "enProceso";
    this.update();
  }

  finalizarTarea(): void{
    this.tarea.estado = "Finalizada";
    this.update();
  }

  cambioTareaPadre(): void{
    this.tarea.tareasPrecedentes = this.tarea.tareaPadre.tareasPrecedentes;
  }

  completarSector(): void{
    this.sectorService.getSector(this.tarea.sector.id).subscribe(sector => {
      this.tarea.sector = sector
      this.tarea.sector.actores = this.tarea.sector.actores.filter(actor => !actor.encargado)
    })
  }

}
