import { Component, OnInit } from '@angular/core';
import { TareaService } from '../tarea.service';
import { Tarea } from '../tarea';
import * as $ from 'jquery';
import { Network, DataSet } from 'vis';
import { ActivatedRoute, Router } from '@angular/router';
import { SectorService } from 'src/app/settings/sectores/sector.service';
import { Sector } from 'src/app/settings/sectores/sector';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tareas-rama',
  templateUrl: './tareas-rama.component.html',
  styleUrls: ['./tareas-rama.component.css']
})
export class TareasRamaComponent implements OnInit {

private errores: string[];

private nodes;
private edges;
private network: Network;

private editTarea: Tarea = new Tarea();
private tarea: Tarea;
private tareaPadre: Tarea = null;
private sectores: Sector[];

private clusterOptionsByData = [];

private ramaTareas: Tarea[];
private hasSubTareas: boolean;

constructor(private tareaService: TareaService, private sectorService: SectorService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.sectorService.getSectores().subscribe(sectores => {
      this.sectores = sectores
    })

    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.tareaService.getTarea(id).subscribe(tarea => {
          this.tarea = tarea
          this.tareaService.getRamaTareas(id).subscribe(tareas => {
            this.tareaPadre = this.tarea.tareaPadre
            this.crearRama(tareas)
          });
        })
      }
    })
  }

  abrirSubtareas(): void{
    if(this.network.getSelectedNodes().length!=0){
      this.tareaService.getSubTareas(this.network.getSelectedNodes()[0]).subscribe(subTareas => {
        this.tareaService.getTarea(this.network.getSelectedNodes()[0]).subscribe(tarea => {
          this.tareaPadre = tarea;
        })
        this.crearRama(subTareas);
      })
    }
  }

  ramaTareaPadre(): void{
    this.tareaService.getRamaTareas(this.tareaPadre.id).subscribe(tareas => {
      this.tareaPadre = this.tareaPadre.tareaPadre;
      this.crearRama(tareas);
    })
  }

  crearRama(tareas: Tarea[]): void{
      this.ramaTareas = tareas;

      this.nodes = new DataSet<any>();
      this.edges = new DataSet<any>();

      tareas.forEach(tarea => {
        var node
        switch(tarea.estado){
          case "Pendiente":
            node = {id: tarea.id, label: tarea.titulo, level: tarea.nivel, fechaMax: tarea.fechaMax, sector: tarea.sector,
                        color: {border: '#343a40',  background: '#B4B8BB',
                                highlight: { border: '#343a40', background: '#B4B8BB'}}, subTareas: false};
            break;
          case "Disponible":
            node = {id: tarea.id, label: tarea.titulo, level: tarea.nivel, fechaMax: tarea.fechaMax, sector: tarea.sector,
                      color: {border: '#1E8134',  background: '#3BC75B',
                              highlight: { border: '#1E8134', background: '#3BC75B'}}, subTareas: false};
            break;
          case "enProceso":
            node = {id: tarea.id, label: tarea.titulo, level: tarea.nivel, fechaMax: tarea.fechaMax, sector: tarea.sector,
                      color: {border: '#DAA609',  background: '#ffc107',
                              highlight: { border: '#DAA609', background: '#ffc107'}}, subTareas: false};
            break;
          case "Finalizada":
            node = {id: tarea.id, label: tarea.titulo, level: tarea.nivel, fechaMax: tarea.fechaMax, sector: tarea.sector,
                      color: {border: '#B82C39',  background: '#FF4444',
                              highlight: { border: '#B82C39', background: '#FF4444'}}, subTareas: false};
            break;
        }

        if(tarea.id == this.tarea.id){
          node.borderWidth = 2;
          node.borderWidthSelected = 3;
          node.color.border = '#077BBA';
          node.color.highlight.border = '#077BBA';
        }


        this.tareaService.getSubTareas(tarea.id).subscribe(subTareas => {
          if(subTareas.length!=0){
            node.subTareas = true;
          }
          this.nodes.add(node);
        })

        tarea.tareasPrecedentes.forEach(tareaPrecedente => {
          var edge = {from: tarea.id, to: tareaPrecedente.id};
          this.edges.add(edge);
        })

      })

        // create a network
        var container = document.getElementById('mynetwork');
        var data = {
          nodes: this.nodes,
          edges: this.edges
        };

        var locales = {
          en: {
            edit: 'Editar',
            del: 'Eliminar seleccionado',
            back: 'Volver',
            addNode: 'Añadir Tarea',
            addEdge: 'Añadir tarea precedente',
            editNode: 'Editar Tarea',
            editEdge: 'Editar tarea precedente',
            addDescription: 'Pulsa en un espacio en blanco para añadir una tarea.',
            edgeDescription: 'Pulsa en una tarea y arrastra hacia la tarea precedente para añadirla como tarea precedente.',
            editEdgeDescription: 'Pulsa en el punto de conexión y arrastra a una tarea para añadirla como tarea precedente.',
            createEdgeError: 'Error al añadir como tarea precedente.',
            deleteClusterError: 'Error al eliminar.',
            editClusterError: 'Error al editar.'
          }
        }

        var options = {
          locale: 'en',
          locales: locales,
          autoResize: true,
          width: '100%',
          height: (window.innerHeight - 200) + "px",
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
                levelSeparation: 150,
                nodeSpacing: 250,
                treeSpacing: 400,
                blockShifting: true,

                //parentCentralization: false
            }
          },
          interaction: {
            dragNodes: true,
            //dragView: false,
            multiselect: false,
            //zoomView: false,
            selectConnectedEdges: false
          },
          manipulation: {
            initiallyActive: true,
            addNode: (data, callback) => {
              document.getElementById("node-operation").innerHTML = "Añadir Tarea";
              this.editNode(data, this.clearNodePopUp, callback);
            },
            editNode: (data, callback) => {
              if(data!=null){
                this.router.navigate(['/tareas/form', data.id]);
              }
            },
            deleteNode: (data, callback) => {
              this.deleteNode(data, callback);
            },
            addEdge: (data, callback) => {
              if (data.from == data.to) {
                callback(null);
                return;
              }
              this.editEdgeWithoutDrag(data, callback);
            },
            editEdge: false,
            deleteEdge: (data, callback) => {
              this.deleteEdge(data, callback);
            }
          },
          physics:{
            enabled: false,
            hierarchicalRepulsion: {
              centralGravity: 1.0,
              springLength: 200,
              springConstant: 0.99,
              nodeDistance: 200,
              damping: 0.1,
            },
          }
        };


        setTimeout( () => {
          this.network = new Network(container, data, options);

          this.network.on('doubleClick', (event)=> {
            this.abrirSubtareas();
          })

          this.network.on('hold', (params)=>{
            let id = params.nodes[0]
            if(id!=null){
              this.tareaService.getTarea(id).subscribe(tarea => {
                this.editTarea = tarea
                this.tareaService.getSubTareas(this.editTarea.id).subscribe(subTareas => {
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
                document.getElementById("edicion-estado").style.display = "block";
              })

            }
          })

          this.network.on('select', (params)=>{
            document.getElementById("edicion-estado").style.display = "none";
          })

        }, 500 );
  }



  editNode(data, cancelAction, callback) {
    this.editTarea = new Tarea();

    document.getElementById("node-saveButton").onclick = this.saveNodeData.bind(
      this,
      data,
      callback
    );
    document.getElementById("node-cancelButton").onclick = cancelAction.bind(
      this,
      callback
    );
    document.getElementById("node-popUp").style.display = "block";
  }

  deleteNode(data, callback){
    this.tareaService.delete(data.nodes[0]).subscribe(response => {
      if(this.tareaPadre == null){
        this.tareaService.getTareasPadre().subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      } else{
        this.tareaService.getSubTareas(this.tareaPadre.id).subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      }
    });
  }

// Callback passed as parameter is ignored
  clearNodePopUp() {
    document.getElementById("node-saveButton").onclick = null;
    document.getElementById("node-cancelButton").onclick = null;
    document.getElementById("node-popUp").style.display = "none";
  }

  cancelNodeEdit(callback) {
    this.clearNodePopUp();
    callback(null);
  }

  saveNodeData(data, callback) {
    this.editTarea.tareaPadre = this.tareaPadre;
    this.tareaService.create(this.editTarea).subscribe(response => {
      if(this.tareaPadre == null){
        this.tareaService.getTareasPadre().subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      } else{
        this.tareaService.getSubTareas(this.tareaPadre.id).subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      }
    })
    this.cancelNodeEdit(callback)
  }

  editEdgeWithoutDrag(data, callback) {
    // filling in the popup DOM elements
    this.saveEdgeData(data, callback)
  }

  saveEdgeData(data, callback) {
    if (typeof data.to === "object") data.to = data.to.id;
    if (typeof data.from === "object") data.from = data.from.id;

    let index = this.ramaTareas.indexOf(this.ramaTareas.find(tarea => tarea.id == data.from))
    let indexPrecedente = this.ramaTareas.indexOf(this.ramaTareas.find(tarea => tarea.id == data.to))
    this.ramaTareas[index].tareasPrecedentes.push(this.ramaTareas[indexPrecedente])

    this.tareaService.update(this.ramaTareas[index]).subscribe(response =>{
      if(this.tareaPadre == null){
        this.tareaService.getTareasPadre().subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      } else{
        this.tareaService.getSubTareas(this.tareaPadre.id).subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      }
    }, err => {
      let borrado = this.ramaTareas[index].tareasPrecedentes.indexOf(this.ramaTareas[indexPrecedente]);
      this.ramaTareas[index].tareasPrecedentes.splice(borrado, 1);
      callback(null)
    });
  }

  deleteEdge(data, callback) {
    let edge = this.edges._data[data.edges[0]]
    let index = this.ramaTareas.indexOf(this.ramaTareas.find(tarea => tarea.id == edge.from))
    let indexPrecedente = this.ramaTareas.indexOf(this.ramaTareas.find(tarea => tarea.id == edge.to))

    let borrado = this.ramaTareas[index].tareasPrecedentes.indexOf(this.ramaTareas[indexPrecedente]);
    this.ramaTareas[index].tareasPrecedentes.splice(borrado, 1);

    this.tareaService.update(this.ramaTareas[index]).subscribe(response =>{
      if(this.tareaPadre == null){
        this.tareaService.getTareasPadre().subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      } else{
        this.tareaService.getSubTareas(this.tareaPadre.id).subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      }
    }, err => {
      this.ramaTareas[index].tareasPrecedentes.push(this.ramaTareas[indexPrecedente])
      callback(null)
    });
  }

  empezarTarea(): void{
    this.editTarea.estado = "enProceso";
    this.tareaService.update(this.editTarea).subscribe(response =>{
      if(this.tareaPadre == null){
        this.tareaService.getTareasPadre().subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      } else{
        this.tareaService.getSubTareas(this.tareaPadre.id).subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      }
    });
    document.getElementById('edicion-estado').style.display = "none";
  }

  finalizarTarea(): void{
    this.editTarea.estado = "Finalizada";
    this.tareaService.update(this.editTarea).subscribe(response =>{
      if(this.tareaPadre == null){
        this.tareaService.getTareasPadre().subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      } else{
        this.tareaService.getSubTareas(this.tareaPadre.id).subscribe(ramaTareas => {
          this.crearRama(ramaTareas)
        })
      }
    });
    document.getElementById('edicion-estado').style.display = "none";
  }

}
