import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Tarea } from 'src/app/objects/tarea';
import { Sector } from 'src/app/objects/sector';
import { Usuario } from 'src/app/objects/usuario';
import { TareaService } from 'src/app/services/tarea.service';
import { SectorService } from 'src/app/services/sector.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { Comentario } from 'src/app/objects/comentario';
import {Location} from '@angular/common';

@Component({
  selector: 'app-tareas-form',
  templateUrl: './tareas-form.component.html',
  styleUrls: ['./tareas-form.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TareasFormComponent implements OnInit {

  private editando: boolean;

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

  private usuarioLogged: Usuario = new Usuario();

  private comentarioNuevo: Comentario = new Comentario();

  constructor(private authService: AuthenticationService, private tareaService: TareaService, private sectorService: SectorService, private usuarioService: UsuarioService, private router: Router, private activatedRoute: ActivatedRoute, private _location: Location) { }

  ngOnInit() {
    this.cargarTarea();
    this.sectorService.getSectores().subscribe(sectores => {
      this.sectores = sectores;
    });
    this.usuarioService.getUsuarios().subscribe(usuarios => {
      this.usuarios = usuarios
      this.usuarioLogged = this.usuarios.find(usuario => usuario.email == this.authService.getLoggedInUserName());
    })

    //ajustes select usuarios
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

    //ajustes select actores
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

      //Obtenemos todas las tareas padre y las recorremos para obtener sus hijos recursivamente.
      tareasPadre.forEach(tareaPadre => {
        this.obtenerSubtareas(tareaPadre)
      })
      //Esperamos a que se haya completado el forEach
      setTimeout( () => {
        this.tareasPadre = tareasPadre
      }, 1500 );

      this.activatedRoute.params.subscribe(params => {
        let id = params['id']
        //Si hay un id en la ruta, obtenemos la tarea.
        if(id){
          this.tareaService.getTarea(id).subscribe( tarea => {
            this.tarea = tarea;
            this.tarea.sector.actores = this.tarea.sector.actores.filter(actor => !actor.encargado)
            this.tareaService.getComentarios(this.tarea.id).subscribe(comentarios => {
              this.tarea.comentarios = comentarios;
            })
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
            //Si la tarea recogida no tiene tarea padre(es null), creamos una nueva tarea vacia con id null
            //Esto se hace para que en el ngModel del formulario no de error al ser null la tarea padre.
            if(this.tarea.tareaPadre==null){
              this.tarea.tareaPadre=new Tarea();
              this.tarea.tareaPadre.id = null;
            }
          })
        }else{
          this.editando = true
        }
      })
    });

  }

  obtenerSubtareas(tarea: Tarea){
    tarea.subTareas = new Array<Tarea>()
    this.tareaService.getSubTareas(tarea.id).subscribe(subTareas => {
      subTareas.forEach(subTarea => {
        this.obtenerSubtareas(subTarea)
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
  }

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

  //Cambio de estado
  empezarTarea(): void{
    this.tarea.estado = "enProceso";
    this.update();
  }

  //Cambio de estado
  finalizarTarea(): void{
    this.tarea.estado = "Finalizada";
    this.update();
  }

  //Al seleccionar una tarea padre, se autoselecciona como tareas precedentes las de la tarea padre
  //Esto es para las subtareas de nivel 1 de una tarea padre, ya que dependenderán de las mismas tareas que su tarea padre
  cambioTareaPadre(): void{
    this.tarea.tareasPrecedentes = this.tarea.tareaPadre.tareasPrecedentes;
  }

  completarSector(): void{
    if(this.tarea.sector.id != null){
      this.sectorService.getSector(this.tarea.sector.id).subscribe(sector => {
        this.tarea.sector = sector
        this.tarea.sector.actores = this.tarea.sector.actores.filter(actor => !actor.encargado)
      })
    }
  }

  cancelarEditar(): void{
    this.editando = false;
    this.cargarTarea()
  }

  crearComentario(): void{
    this.comentarioNuevo.tarea = this.tarea;
    this.comentarioNuevo.usuario = this.usuarioLogged;
    this.tareaService.crearComentario(this.comentarioNuevo).subscribe(response => {
      this.tarea.comentarios.push(response.comentario)
      this.comentarioNuevo = new Comentario();
    })
  }

  eliminarComentario(comentario): void{
    this.tareaService.eliminarComentario(comentario.id).subscribe(response => {
      let index = this.tarea.comentarios.indexOf(comentario)
      this.tarea.comentarios.splice(index, 1);
    })
  }

  volver(): void{
    this._location.back();
  }

}
