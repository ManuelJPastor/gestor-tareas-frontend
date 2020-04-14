import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Tarea } from '../tarea';
import { TareaService } from '../tarea.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SectorService } from 'src/app/settings/sectores/sector.service';
import { Sector } from 'src/app/settings/sectores/sector';
import { DataSet, Network } from 'vis';
import * as $ from 'jquery';

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
  private tareas: Tarea[];
  private tareasPadre : Tarea[];

  private selectTareasPrecedentes:any = {};
  private selectSector:any = {};

  private nodes = new DataSet<any>();
  private edges = new DataSet<any>();
  private data: {nodes: DataSet<any>, edges: DataSet<any>};
  private options:any;

  private networkTareaPadre: Network;
  private openNetworkTareaPadre: boolean = false;

  private networkTareasPrecedentes: Network;
  private openNetworkTareasPrecedentes: boolean = false;

  private clusterOptionsByData = [];


  constructor(private tareaService: TareaService, private sectorService: SectorService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarTarea();

    this.selectTareasPrecedentes = {
      singleSelection: false,
      idField: 'id',
      textField: 'titulo',
      itemsShowLimit: 3,
      maxHeight: 150,
      noDataAvailablePlaceholderText: ""
    }


  }

  crearSubtareas(tarea: Tarea): void{
    var node;
    this.tareaService.getSubTareas(tarea.id).subscribe(subTareas => {
      if(subTareas.length!=0){


        subTareas.forEach(subTarea => {
          this.crearSubtareas(subTarea)
        });

        this.clusterOptionsByData.push({
          joinCondition: function(childOptions) {
            if(childOptions.tareaPadre!=null){
              return childOptions.tareaPadre.id == tarea.id;
            } else{
              return false;
            }

          },
          clusterNodeProperties: {
            id: tarea.id,
            borderWidth: 3,
            shape: "box",
            color: {
              border: "blue"
            },
            allowSingleNodeCluster: true,
            label: tarea.titulo,
            level: tarea.nivel,
            tareaPadre: tarea.tareaPadre
          }
        })

      }else{
        node = {id: tarea.id, label: tarea.titulo, level: (tarea.tareaPadre.nivel + tarea.nivel) - 1, tareaPadre: tarea.tareaPadre};
        this.nodes.add(node);
        tarea.tareasPrecedentes.forEach(tareaPrecedente => {
          var edge = {from: tarea.id, to: tareaPrecedente.id};
          this.edges.add(edge);
        })
      }

    });
  }

  cargarAjustesNetwork(){
    this.tareasPadre.forEach(tarea => {
      this.crearSubtareas(tarea)
    })

    this.data = {
      nodes: this.nodes,
      edges: this.edges
    };

    this.options = {
      autoResize: true,
      width: '100%',
      height: (window.innerHeight - 150) + "px",
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
        width: 2,
        arrows: 'from',
        smooth: true,
        color: {
          color:'#848484',
          highlight:'#848484',
          hover: '#848484',
          inherit: 'from',
          opacity:1.0
        }
      },
      layout: {
        hierarchical: {
            direction: 'UD',
            nodeSpacing: 250,
            //parentCentralization: false
        }
      },
      interaction: {
        dragNodes: false,
        //dragView: false,
        multiselect: false,
        zoomView: false,
        selectConnectedEdges: false
      },
      physics:{
        enabled: true
      }
    };
  }

  seleccionarTareaPadre(): void{
    var nodes = this.networkTareaPadre.getSelectedNodes()
    if(nodes.length!=0){
      this.tarea.tareaPadre = this.tareas.find(tareaPadre => tareaPadre.id == nodes[0])
      if(this.data.nodes.getIds().includes(this.tarea.id)){
        //this.data.nodes.get().find(node => node.id == this.tarea.id).tareaPadre.id = nodes[0]
        console.log(this.data.nodes.get())
      } else{
        console.log("es un cluster")
      }
      this.crearNetworkTareaPadre()
    }
  }

  crearNetworkTareaPadre(): void{
    this.openNetworkTareaPadre = true;
    var container = document.getElementById('networkTareaPadre');
    this.networkTareaPadre = new Network(container, this.data, this.options);
    this.networkTareaPadre.on('doubleClick', (params) => {
      if (params.nodes.length == 1) {
        if (this.networkTareaPadre.isCluster(params.nodes[0]) == true) {
          this.networkTareaPadre.openCluster(params.nodes[0]);
          this.networkTareaPadre.stopSimulation();
          this.networkTareaPadre.redraw();
        }
      }
    })

    for(var i=this.clusterOptionsByData.length-1; i>=0; i--){
      this.networkTareaPadre.cluster(this.clusterOptionsByData[i])
    }
  }

  crearNetworkTareasPrecedentes(): void{
    this.openNetworkTareasPrecedentes = true;
    var container = document.getElementById('networkTareasPrecedentes');
    this.networkTareasPrecedentes = new Network(container, this.data, this.options);
    this.networkTareasPrecedentes.on('doubleClick', (params) => {
      if (params.nodes.length == 1) {
        if (this.networkTareasPrecedentes.isCluster(params.nodes[0]) == true) {
          this.networkTareasPrecedentes.openCluster(params.nodes[0]);
          this.networkTareasPrecedentes.stopSimulation();
          this.networkTareasPrecedentes.redraw();
        } else{
          var nodes = this.networkTareasPrecedentes.getSelectedNodes()
          if(nodes.length!=0){
            this.tarea.tareasPrecedentes.push(this.tareas.find(tareaPrecedente => tareaPrecedente.id == nodes[0]))
            this.completarTareasPrecedentes()
            var tareasPrecedentes = this.tareas.filter(tarea => this.tarea.tareasPrecedentes.includes(tarea))
            this.tarea.tareasPrecedentes = tareasPrecedentes
            if(this.data.nodes.getIds().includes(this.tarea.id)){
              //this.data.nodes.get().find(node => node.id == this.tarea.id).tareaPadre.id = nodes[0]
            } else{
              console.log("es un cluster")
            }
            this.crearNetworkTareasPrecedentes()
          }
        }
      }
    })

    for(var i=this.clusterOptionsByData.length-1; i>=0; i--){
      this.networkTareasPrecedentes.cluster(this.clusterOptionsByData[i])
    }
  }

  destroyNetworkTareaPadre(){
    this.openNetworkTareaPadre = false;
    this.networkTareaPadre.destroy();
  }

  destroyNetworkTareasPrecedentes(){
    this.openNetworkTareasPrecedentes = false;
    this.networkTareasPrecedentes.destroy();
  }

  vaciarTareaPadre(){
    this.tarea.tareaPadre = new Tarea();
    this.tarea.tareasPrecedentes = [];
  }

  completarJsonTarea(): void{
    if(this.tarea.tareaPadre.id==null){
      this.tarea.tareaPadre=null;
    }else{
      this.tarea.tareaPadre = this.tareas.find(tareaPadre => tareaPadre.id == this.tarea.tareaPadre.id);
    }
    this.completarTareasPrecedentes();
  }

  completarTareasPrecedentes(): void{
    let ids : Array<Number> = [];
    this.tarea.tareasPrecedentes.forEach(tareaPrecedente => ids.push(tareaPrecedente.id));
    this.tarea.tareasPrecedentes = this.tareas.filter(tarea => ids.includes(tarea.id));
  }

  cargarTarea(): void{
    this.tarea.tareaPadre = new Tarea();
    this.sectorService.getSectores().subscribe(sectores => this.sectores = sectores);
    this.tareaService.getTareas().subscribe(tareas => {
      this.tareas = tareas;
      this.tareasPadre = this.tareas.filter(tarea => tarea.tareaPadre==null)
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
          })
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
