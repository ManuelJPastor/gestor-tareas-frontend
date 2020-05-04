import { Component, OnInit } from '@angular/core';
import { TareaService } from '../tarea.service';
import { Tarea } from '../tarea';
import * as $ from 'jquery';
import { Network, DataSet } from 'vis';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tareas-rama',
  templateUrl: './tareas-rama.component.html',
  styleUrls: ['./tareas-rama.component.css']
})
export class TareasRamaComponent implements OnInit {

private nodes;
private edges;
private network: Network;

private tarea: Tarea;
private tareaPadre: Tarea = null;

private clusterOptionsByData = [];

private ramaTareas: Tarea[];

private hasSubTareas:Boolean;

constructor(private tareaService: TareaService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

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

  crearRama(tareas: Tarea[]): void{
      this.ramaTareas = tareas;

      this.nodes = new DataSet<any>();
      this.edges = new DataSet<any>();

      tareas.forEach(tarea => {

        var node
        if(tarea.id == this.tarea.id){

          node = {id: tarea.id, label: tarea.titulo, level: tarea.nivel,
                      color: {border: '#FE0303',  background: '#FF4444',
                              highlight: { border: '#FE0303', background: '#FF4444'}}, subTareas: false};
        } else{
          node = {id: tarea.id, label: tarea.titulo, level: tarea.nivel, subTareas: false};
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

        var options = {
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
                nodeSpacing: 250,
                //parentCentralization: false
            }
          },
          interaction: {
            dragNodes: false,
            //dragView: false,
            multiselect: false,
            //zoomView: false,
            selectConnectedEdges: false
          },
          manipulation: {
            addNode: (data, callback) => {
              // filling in the popup DOM elements
              document.getElementById("node-operation").innerHTML = "Add Node";
              this.editNode(data, this.clearNodePopUp, callback);
            },
            editNode: (data, callback) => {
              // filling in the popup DOM elements
              document.getElementById("node-operation").innerHTML = "Edit Node";
              this.editNode(data, this.cancelNodeEdit, callback);
            },
            addEdge: (data, callback) => {
              if (data.from == data.to) {
                var r = confirm("Do you want to connect the node to itself?");
                if (r != true) {
                  callback(null);
                  return;
                }
              }
              document.getElementById("edge-operation").innerHTML = "Add Edge";
              this.editEdgeWithoutDrag(data, callback);
            },
            editEdge: {
              editWithoutDrag: (data, callback) => {
                document.getElementById("edge-operation").innerHTML = "Edit Edge";
                this.editEdgeWithoutDrag(data, callback);
              }
            }
          },
          physics:{
            enabled: true
          }
        };


        setTimeout( () => {
          this.network = new Network(container, data, options);
          this.network.on('doubleClick', (event)=> {
            var nodos = event.nodes
            if(nodos.length!=0){
              this.router.navigate(['/tareas/form',nodos[0]])
            }
          })

          this.network.on('selectNode', (params) => {
            if (params.nodes.length == 1) {

              var node = this.nodes.get({
                filter: function (node) {
                  return node.id == params.nodes[0];
                }
              })
              if(node[0].subTareas){
                this.hasSubTareas=true;
              } else{
                this.hasSubTareas=false;
              }
            }
          })

          this.network.on('deselectNode', (params) => {
            if (params.nodes.length == 0) {
              this.hasSubTareas=false;
            }
          })

          for(var i=this.clusterOptionsByData.length-1; i>=0; i--){
            this.network.cluster(this.clusterOptionsByData[i])
            this.clusterOptionsByData.splice(i,1)
          }

        }, 500 );
  }

  abrirSubtareas(): void{
    if(this.network.getSelectedNodes().length!=0){
      this.tareaService.getSubTareas(this.network.getSelectedNodes()[0]).subscribe(subTareas => {
        this.tareaService.getTarea(this.network.getSelectedNodes()[0]).subscribe(tarea => {
          this.tareaPadre = tarea;
        })
        this.hasSubTareas=false
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

  editNode(data, cancelAction, callback) {
  document.getElementById("node-label").nodeValue = data.label;
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
    data.label = document.getElementById("node-label").nodeValue;
    this.clearNodePopUp();
    callback(data);
  }

  editEdgeWithoutDrag(data, callback) {
    // filling in the popup DOM elements
    document.getElementById("edge-label").nodeValue = data.label;
    document.getElementById("edge-saveButton").onclick = this.saveEdgeData.bind(
      this,
      data,
      callback
    );
    document.getElementById("edge-cancelButton").onclick = this.cancelEdgeEdit.bind(
      this,
      callback
    );
    document.getElementById("edge-popUp").style.display = "block";
  }

  clearEdgePopUp() {
    document.getElementById("edge-saveButton").onclick = null;
    document.getElementById("edge-cancelButton").onclick = null;
    document.getElementById("edge-popUp").style.display = "none";
  }

  cancelEdgeEdit(callback) {
    this.clearEdgePopUp();
    callback(null);
  }

  saveEdgeData(data, callback) {
    if (typeof data.to === "object") data.to = data.to.id;
    if (typeof data.from === "object") data.from = data.from.id;
    data.label = document.getElementById("edge-label").nodeValue;
    this.clearEdgePopUp();
    callback(data);
  }

}
