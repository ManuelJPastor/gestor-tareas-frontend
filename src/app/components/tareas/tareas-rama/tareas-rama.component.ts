import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as $ from 'jquery';
import { Network, DataSet } from 'vis';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf'
import { Tarea } from 'src/app/objects/tarea';
import { Sector } from 'src/app/objects/sector';
import { TareaService } from 'src/app/services/tarea.service';
import { SectorService } from 'src/app/services/sector.service';

@Component({
  selector: 'app-tareas-rama',
  templateUrl: './tareas-rama.component.html',
  styleUrls: ['./tareas-rama.component.css'],
  encapsulation: ViewEncapsulation.None
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

    document.getElementById('mynetwork').style.height = (window.innerHeight - 200) + "px";
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
          autoResize: false,
          width: '100%',
          height: '100%',
          nodes: {
            shape: "box",
            margin: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10
            },
            widthConstraint: {
              maximum: 100
            },
            scaling: {
              min: 10,
              max: 30,
              label: {
                enabled: false,
                min: 14,
                max: 30,
                maxVisible: 50,
                drawThreshold: 1
              }
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
                levelSeparation: 120,
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
              centralGravity: 0.0,
              springLength: 0,
              springConstant: 0.1,
              nodeDistance: 200,
              damping: 0.9,
            },
          }
        };

        this.network = new Network(container, data, options);

        let buttonSave = document.createElement("div");
        buttonSave.className = "vis-button vis-guardar-rama";
        buttonSave.onclick = () => {
          this.imprimirRama(container);

        }

        let labelSave = document.createElement("div");
        labelSave.className = "vis-label";
        labelSave.innerHTML = 'Guardar rama';

        buttonSave.appendChild(labelSave)
        document.getElementsByClassName("vis-add")[0].before(buttonSave);

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

  imprimirRama(container):void {
    //container.style.opacity = '0';
    var heigthInicial = container.style.height;
    var widthInicial = container.style.width;

    let yMin = Number.MAX_SAFE_INTEGER
    let yMax = Number.MIN_SAFE_INTEGER
    this.nodes.forEach(node => {
      // Using bounding box takes node height into account
      const boundingBox = this.network.getBoundingBox(node.id)
      if(boundingBox.top < yMin)
        yMin = boundingBox.top

      if(boundingBox.bottom > yMax)
        yMax = boundingBox.bottom
    })

    // Accounts for some node label clipping
    const heightOffset = 200

    // "Natural" aka 1.0 zoom height of the network
    const naturalHeight = yMax - yMin + heightOffset

    // container is a <div /> around the network with fixed px height;
    // the child network <canvas /> is height 100%
    container.style.height = naturalHeight + 'px'

    // Lets the network adjust to its new height inherited from container,
    // then fit() to zoom out as needed; note `autoResize` must be DISABLED for the network
    this.network.redraw()
    this.network.fit()

    // Sometimes the network grows too wide and fit() zooms out accordingly;
    // in this case, scale the height down and redraw/refit
    container.style.height = this.network.getScale() * naturalHeight + 'px'
    this.network.redraw()
    this.network.fit()

    let xMin = Number.MAX_SAFE_INTEGER
    let xMax = Number.MIN_SAFE_INTEGER
    this.nodes.forEach(node => {
      // Using bounding box takes node height into account
      const boundingBox = this.network.getBoundingBox(node.id)
      if(boundingBox.left < xMin)
        xMin = boundingBox.left

      if(boundingBox.right > xMax)
        xMax = boundingBox.right
    })

    // Accounts for some node label clipping
    const widthOffset = 50

    // "Natural" aka 1.0 zoom height of the network
    const naturalWidth = xMax - xMin + widthOffset

    // container is a <div /> around the network with fixed px height;
    // the child network <canvas /> is height 100%
    container.style.width = naturalWidth + 'px'

    // Lets the network adjust to its new height inherited from container,
    // then fit() to zoom out as needed; note `autoResize` must be DISABLED for the network
    this.network.redraw()
    this.network.fit()

    // Sometimes the network grows too wide and fit() zooms out accordingly;
    // in this case, scale the height down and redraw/refit
    container.style.width = this.network.getScale() * naturalWidth + 'px'
    this.network.redraw()
    this.network.fit()

    setTimeout( () => {
      var canvas = document.getElementsByTagName("canvas")[0];
      var imgData = canvas.toDataURL("rama-"+this.tarea.titulo+"/jpeg", 1.0);

      let width = canvas.width;
      let height = canvas.height;
      let pdf;
      pdf = new jsPDF();
      //set the orientation
      if(width > height){
        pdf = new jsPDF('l', 'px', [width, height]);
      }
      else{
        pdf = new jsPDF('p', 'px', [height, width]);
      }
      //then we get the dimensions from the 'pdf' file itself
      width = pdf.internal.pageSize.getWidth();
      height = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0,width,height);
      pdf.save("rama-"+this.tarea.titulo+".pdf");
      container.style.height = heigthInicial;
      container.style.width = widthInicial;
      this.network.redraw()
      this.network.fit();
      //container.style.opacity = '100';
    }, 1000);
  }

}
