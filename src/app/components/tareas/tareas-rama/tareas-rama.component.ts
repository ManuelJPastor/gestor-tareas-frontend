import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Network, DataSet } from 'vis';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf'
import { Tarea } from 'src/app/objects/tarea';
import { Sector } from 'src/app/objects/sector';
import { TareaService } from 'src/app/services/tarea.service';
import { SectorService } from 'src/app/services/sector.service';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from 'src/app/services/auth.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Usuario } from 'src/app/objects/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';

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
private tarea: Tarea = new Tarea();
private tareaPadre: Tarea = null;
private sectores: Sector[];
private usuarios: Usuario[];

private usuariosSettings: IDropdownSettings;

private clusterOptionsByData = [];

private ramaTareas: Tarea[];
private hasSubTareas: boolean;

private desplegarSubtareas: boolean = false;
//Leyenda
private leyenda: {actual: any, pendiente: any, disponible: any, enProceso: any, finalizada: any};
//Colores disponibles
private colores = {
                  azul: {border: '#026AA2',  background: '#077BBA', highlight: { border: '#026AA2', background: '#077BBA'}},
                  gris: {border: '#343a40',  background: '#B4B8BB', highlight: { border: '#343a40', background: '#B4B8BB'}},
                  verde: {border: '#1E8134',  background: '#3BC75B', highlight: { border: '#1E8134', background: '#3BC75B'}},
                  amarillo: {border: '#DAA609',  background: '#ffc107', highlight: { border: '#DAA609', background: '#ffc107'}},
                  rojo: {border: '#B82C39',  background: '#FF4444', highlight: { border: '#B82C39', background: '#FF4444'}}
                };

constructor(private datepipe: DatePipe,private usuarioService: UsuarioService, private tareaService: TareaService, private sectorService: SectorService, private activatedRoute: ActivatedRoute, private router: Router, private auth: AuthenticationService) { }

  ngOnInit(): void {

    //Leyenda por defecto
    this.leyenda = {actual:  this.colores.azul.background,
      pendiente: this.colores.gris,
      disponible: this.colores.verde,
      enProceso: this.colores.amarillo,
      finalizada: this.colores.rojo}

    this.sectorService.getSectores().subscribe(sectores => {
      this.sectores = sectores
    })
    this.usuarioService.getUsuarios().subscribe(usuarios => {
      this.usuarios = usuarios
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

    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.tareaService.getTarea(id).subscribe(tarea => {
          this.tarea = tarea
          this.tareaService.getRamaTareas(id).subscribe(tareas => {
            this.tareaPadre = this.tarea.tareaPadre
            this.crearRama(tareas)
          });
        },
        err=>{
          Swal.fire('Tarea no encontrada' ,'La tarea con id '+id+' no existe.', 'error');
          this.tareaService.getTareasPadre().subscribe(tareas => {
            this.crearRama(tareas)
          })
        })
      }
      else{
        this.tareaService.getTareasPadre().subscribe(tareas => {
          this.crearRama(tareas)
        })
      }
    })
    //Desactivar acción click derecho en mynetwork
    document.getElementById('mynetwork').oncontextmenu = function() {return false;}

    //Tamaño de visualización
    document.getElementById('mynetwork').style.height = (window.innerHeight - 200) + "px";
  }

  //Al realizar cambio en la leyenda se actualiza la rama con el nuevo color
  cambiarLeyenda(tipo: string): void{
    var color = document.getElementById(tipo).value
    if(tipo == 'actual'){
      this.leyenda[tipo] = this.colores[color].background
    }else{
      this.leyenda[tipo] = this.colores[color]
    }
    this.crearRama(this.ramaTareas)
  }

//Cambia la rama a la de las subtareas de la tarea seleccionada
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
        //Se crea el nodo de la tarea
        node = {id: tarea.id, label: `${tarea.titulo}\n<b>(${this.datepipe.transform(tarea.fechaMax, 'dd-MM-yyyy')})</b>`,
                level: tarea.nivel, fechaMax: tarea.fechaMax, sector: tarea.sector, subTareas: false};

        //Se asigna el color de la tarea según el estado
        switch(tarea.estado){
          case "Pendiente":
            node.color = Object.assign({} , this.leyenda.pendiente);
            break;
          case "Disponible":
            node.color = Object.assign({} , this.leyenda.disponible);
            break;
          case "enProceso":
            node.color = Object.assign({} , this.leyenda.enProceso);
            break;
          case "Finalizada":
            node.color = Object.assign({} , this.leyenda.finalizada)
            break;
        }

        //Se le cambia el borde si es la tarea por la cual se ha entrado a la visualización
        if(tarea.id == this.tarea.id){
          node.borderWidth = 2;
          node.borderWidthSelected = 3;
          node.color.border = this.leyenda.actual;
          node.color.highlight.border = this.leyenda.actual;
        }

        //Se indica si tiene subtareas, y si esta la opción de desplegarSubtareas se crean las subtareas
        this.tareaService.getSubTareas(tarea.id).subscribe(subTareas => {
          if(subTareas.length!=0){
            node.subTareas = true;
            if(this.desplegarSubtareas){
              subTareas.forEach(subTarea => {
                this.crearSubtareas(subTarea, tarea.nivel);
              })
            }
          }
          this.nodes.add(node);
        })

        //Creación de enlaces entre las tareas
        tarea.tareasPrecedentes.forEach(tareaPrecedente => {
          var edge = {from: tarea.id, to: tareaPrecedente.id};
          this.edges.add(edge);
        })

      })

        //Creación de la visualización -> https://visjs.github.io/vis-network/docs/network/
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
          height: '100%',
          nodes: {
            font: {
              multi: 'html'
            },
            shape: "box",
            margin: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10
            },
            widthConstraint: {
              maximum: 200
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
            enabled: true,
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
              this.tareaService.getMisTareas(this.auth.getLoggedInUserName()).subscribe(tareas => {
                if(tareas.find(tarea => tarea.id == data.nodes[0]) || this.auth.isAdmin()){
                  Swal.fire({
                    title: '¿Estas seguro?',
                    text: `¿Desea eliminar la tarea?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: '!Sí, elimínalo!'
                  }).then((result) => {
                    if (result.value) {
                      this.deleteNode(data, callback);
                    }
                  })

                }else{
                  Swal.fire(
                    'Fallo de permisos',
                    'Se necesita ser participante en la tarea para eliminarla.',
                    'error'
                  )
                }
              })
              callback(null);


            },
            addEdge: (data, callback) => {
              if (data.from == data.to) {
                callback(null);
                return;
              }
              this.tareaService.getMisTareas(this.auth.getLoggedInUserName()).subscribe(tareas => {
                if(tareas.find(tarea => tarea.id == data.from) || this.auth.isAdmin()){
                  this.editEdgeWithoutDrag(data, callback);
                } else{
                  Swal.fire(
                    'Fallo de permisos',
                    'Se necesita ser participante en la tarea para añadir una tarea precedente.',
                    'error'
                  )
                }
              })
            },
            editEdge: false,
            deleteEdge: (data, callback) => {
              let id = this.edges._data[data.edges[0]].from
              this.tareaService.getMisTareas(this.auth.getLoggedInUserName()).subscribe(tareas => {
                if(tareas.find(tarea => tarea.id == id) || this.auth.isAdmin()){
                  this.deleteEdge(data, callback);
                } else{
                  Swal.fire(
                    'Fallo de permisos',
                    'Se necesita ser participante en la tarea para añadir una tarea precedente.',
                    'error'
                  )
                  callback(null)
                }
              })
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

        if(this.desplegarSubtareas){
          options.manipulation.enabled = false;
        }

        setTimeout(()=>{
          this.network = new Network(container, data, options);

          this.network.on('oncontext', (event) => {
            var id = this.network.getNodeAt(event.pointer.DOM);
            this.tareaService.getTarea(id).subscribe(tarea => {
              this.editTarea = tarea;
              document.getElementById("node-saveButton").onclick = ()=>{
                this.tareaService.update(this.editTarea).subscribe(response => {
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
                this.clearNodePopUp();
              }
              document.getElementById("node-cancelButton").onclick = ()=>{
                this.clearNodePopUp();
              }

              document.getElementById("node-popUp").style.display = "block";
            })
            document.getElementById("node-operation").innerHTML = "Editar Tarea";
          })

          //Doble click para abrir subtareas
          this.network.on('doubleClick', (event)=> {
            this.abrirSubtareas();
          })

          //Mantener pulsado para mostrar botón cambio de estado
          this.network.on('hold', (params)=>{
            this.tareaService.getMisTareas(this.auth.getLoggedInUserName()).subscribe(tareas => {
              if(tareas.find(tarea => tarea.id == params.nodes[0]) || this.auth.isAdmin()){
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
              }
            })
          })


          this.network.on('select', (params)=>{
            document.getElementById("edicion-estado").style.display = "none";
          })
        }, 500)




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
      Swal.fire(
        '¡Eliminada!',
        'La tarea ha sido borrada.',
        'success'
      )
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

  //Guardado de rama en pdf
  imprimirRama():void {

    //SE AJUSTA EL TAMAÑO DE CANVAS A LA RAMA DE TAREAS PARA PODER REALIZAR LA CAPTURA CON UN TAMAÑO DE LAS TAREAS ÓPTIMO
    var container = document.getElementById('mynetwork');
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

    //DESPUES DE AJUSTAR EL CANVAS SE REALIZA LA CAPTURA Y SE GUARDA EN UN PDF
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

      //SE VUELVE AL TAMAÑO NORMAL DEL CANVAS
      container.style.height = heigthInicial;
      container.style.width = widthInicial;
      this.network.redraw()
      this.network.fit();
    }, 1000);
  }

  desplegarSubTareas(): void{
    this.desplegarSubtareas=!this.desplegarSubtareas;
    this.crearRama(this.ramaTareas);
  }

  crearSubtareas(tarea: Tarea, nivel: number): void{
    var node;
    node = {id: tarea.id, label: `${tarea.titulo}\n<b>(${this.datepipe.transform(tarea.fechaMax, 'dd-MM-yyyy')})</b>`,
            level: (nivel + tarea.nivel), fechaMax: tarea.fechaMax, sector: tarea.sector, subTareas: false};

    switch(tarea.estado){
      case "Pendiente":
        node.color = this.leyenda.pendiente;
        break;
      case "Disponible":
        node.color = this.leyenda.disponible;
        break;
      case "enProceso":
        node.color = this.leyenda.enProceso;
        break;
      case "Finalizada":
        node.color = this.leyenda.finalizada;
        break;
    }

    if(tarea.id == this.tarea.id){
      node.borderWidth = 2;
      node.borderWidthSelected = 3;
      node.color.border = this.leyenda.actual;
      node.color.highlight.border = this.leyenda.actual;
    }

    this.tareaService.getSubTareas(tarea.id).subscribe(subTareas => {
      if(subTareas.length!=0){
        node.subTareas = true;
        if(this.desplegarSubtareas){
          subTareas.forEach(subTarea => {
              this.crearSubtareas(subTarea, node.level);
          })
        }
      }
      this.nodes.add(node);
    })

    var edge = {from: tarea.id, to: tarea.tareaPadre.id, color: {color: 'red', highlight: 'red'}};
    this.edges.add(edge);

    tarea.tareasPrecedentes.forEach(tareaPrecedente => {
      var edge = {from: tarea.id, to: tareaPrecedente.id};
      this.edges.add(edge);
    })
  }

}
