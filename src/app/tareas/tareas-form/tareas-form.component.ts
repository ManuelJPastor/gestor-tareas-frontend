import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Tarea } from '../tarea';
import { TareaService } from '../tarea.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SectorService } from 'src/app/settings/sectores/sector.service';
import { Sector } from 'src/app/settings/sectores/sector';
import { DataSet, Network } from 'vis';

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
  private tareasPrecedentes: Tarea[] = [];

  private idsExclusion: number[];

  private selectTareasPrecedentes:any = {};
  private selectSector:any = {};

  private data:any;
  private options:any;
  private network: Network;
  private isNetwork: boolean = false;

  constructor(private tareaService: TareaService, private sectorService: SectorService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarTarea();

    this.selectTareasPrecedentes = {
      singleSelection: false,
      idField: 'id',
      textField: 'titulo',
      enableCheckAll: false,
      itemsShowLimit: 3,
      allowSearchFilter: true,
      searchPlaceholderText: 'Buscar aquí..',
      maxHeight: 150,
      noDataAvailablePlaceholderText: 'No se encuentran registros'
    }
  }

  cargarAjustesNetwork(){

      var nodes = new DataSet<any>();
      var edges = new DataSet<any>();

      this.tareasPadre.forEach(tareaPadre => {
        var node = {id: tareaPadre.id, label: tareaPadre.titulo, level: tareaPadre.nivel};
        nodes.add(node);
        tareaPadre.tareasPrecedentes.forEach(tareaPrecedente => {
          var edge = {from: tareaPadre.id, to: tareaPrecedente.id};
          edges.add(edge);
        })
      })
        this.data = {
          nodes: nodes,
          edges: edges
        };

        this.options = {
          autoResize: false,
          width: '100%',
          nodes: {
            shape: "box",
            margin: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10
            },
            widthConstraint: {
              maximum: 200
            }
          },
          edges: {
            width: 3
          },
          layout: {
            hierarchical: {
                direction: 'UD',
                nodeSpacing: 250,
                parentCentralization: false
            }
          },
          interaction: {
            dragNodes: false,
            dragView: false,
            multiselect: false,
            zoomView: false,
            selectConnectedEdges: false
          },
          /*configure: {
            showButton: true
          },
          locale: 'es',
          manipulation: {

          }*/

        };
  }

  ramaTareaPadre():void{
    if(this.tareasPadre[0].tareaPadre!=null){
      this.tareaService.getRamaTareas(this.tareasPadre[0].tareaPadre.id).subscribe(tareasPadre => {
        this.tareasPadre = tareasPadre;
        this.cargarAjustesNetwork();
        this.crearNetwork();
      })
    }

  }

  abrirSubtareas(): void{
    if(this.network.getSelectedNodes().length!=0){
      this.tareaService.getSubTareas(this.network.getSelectedNodes()[0]).subscribe(tareasPadre => {
        if(tareasPadre.length!=0){
          this.tareasPadre = tareasPadre;
          this.cargarAjustesNetwork();
          this.crearNetwork();
        }
      })
    }

  }

  seleccionarTareaPadre(): void{
    if(this.network.getSelectedNodes().length!=0){
      this.tarea.tareaPadre = this.tareasPadre.find(tareaPadre => tareaPadre.id == this.network.getSelectedNodes()[0])
      this.cargarRamaTareas();
    }
  }

  crearNetwork(): void{
    this.isNetwork = true;
    var container = document.getElementById('mynetwork');
    this.network = new Network(container, this.data, this.options);
  }

  destroyNetwork(){
    this.isNetwork = false;
    this.network.destroy();
  }

  onTareaSelect(tarea: Tarea){
    this.actualizarTareasPrecedentes();
  }
  onItemDeSelect(tarea: any){
    this.actualizarTareasPrecedentes();
  }

  vaciarTareaPadre(){
    this.tarea.tareaPadre = new Tarea();
    this.tarea.tareasPrecedentes = [];
    this.cargarRamaTareas();
  }

  cargarRamaTareas(){
    if(this.tarea.tareaPadre.id!=null){
      this.tareaService.getSubTareas(this.tarea.tareaPadre.id).subscribe(tareas => {this.ramaTareas = tareas, this.actualizarTareasPrecedentes()});
    } else{
      this.ramaTareas = this.tareasPadre;
      this.actualizarTareasPrecedentes();
    }
  }

  actualizarTareasPrecedentes(): void{
    this.completarTareasPrecedentes();
    this.idsExclusion=[]
    this.tarea.tareasPrecedentes.forEach( tareaPrecedente => {
      this.obtenerIdsExclusion(tareaPrecedente);
    })
    this.tareasPrecedentes = this.ramaTareas.filter(tarea=>!this.idsExclusion.includes(tarea.id) && tarea.id!=this.tarea.id);

    let tareasExclusion: Tarea[] = [];
    this.tarea.tareasPrecedentes.forEach( tareaPrecedente => {
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

  completarJsonTarea(): void{
    if(this.tarea.tareaPadre.id==null){
      this.tarea.tareaPadre=null;
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
    this.tarea.tareaPadre = new Tarea();
    this.sectorService.getSectores().subscribe(sectores => this.sectores = sectores);
    this.tareaService.getTareasPadre().subscribe(tareas => {
      this.tareasPadre = tareas;
      this.cargarAjustesNetwork();

      this.activatedRoute.params.subscribe(params => {
        let id = params['id']
        if(id){
          this.tareaService.getTarea(id).subscribe( tarea => {
            this.tarea = tarea;
            if(this.tarea.tareaPadre==null){
              this.tarea.tareaPadre=new Tarea();
              this.tarea.tareaPadre.id = null;
            }
            //this.tareasPadre = this.tareasPadre.filter(tareaPadre => tareaPadre.id != this.tarea.id)
            this.cargarRamaTareas();
          })
        } else{
          this.cargarRamaTareas();
        }

      })
    });


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
