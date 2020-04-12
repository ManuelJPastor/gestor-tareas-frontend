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

private clusterOptionsByData = [];

private ramaTareas: Tarea[];

constructor(private tareaService: TareaService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.tareaService.getRamaTareas(id).subscribe(tareas => {
          this.ramaTareas = tareas;

          this.nodes = new DataSet<any>();
          this.edges = new DataSet<any>();

          tareas.forEach(tarea => {
            this.crearSubtareas(tarea)
            /*
            if(tarea.id == id){
              node = {id: tarea.id, label: tarea.titulo, level: tarea.nivel,
                          color: {border: '#FE0303',  background: '#FF4444',
                                  highlight: { border: '#FE0303', background: '#FF4444'}}};
            } else{
              node = {id: tarea.id, label: tarea.titulo, level: tarea.nivel};
            }
            nodes.add(node);

            tarea.tareasPrecedentes.forEach(tareaPrecedente => {
              var edge = {from: tarea.id, to: tareaPrecedente.id};
              edges.add(edge);
            })*/

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
                //zoomView: false,
                selectConnectedEdges: false
              },
              manipulation: {
                enabled:true
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
                  if (this.network.isCluster(params.nodes[0]) == true) {
                    this.network.openCluster(params.nodes[0]);
                    this.network.stopSimulation()
                  }
                }
                this.network.redraw();
              })
              for(var i=this.clusterOptionsByData.length-1; i>=0; i--){
                this.network.cluster(this.clusterOptionsByData[i])
                this.clusterOptionsByData.splice(i,1)
              }

            }, 500 );



            /*this.network.on('startStabilizing', ()=>{
              if(this.clusterOptionsByData.length!=0){
                for(var i=this.clusterOptionsByData.length-1; i>=0; i--){
                  this.network.cluster(this.clusterOptionsByData[i])
                  this.clusterOptionsByData.splice(i,1)
                }
              }
            })*/
        })
      }
    })
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



      /*if(subTareas.length!=0){
        subTareas.forEach(subTarea => {
          node = {id: subTarea.id, label: subTarea.titulo, level: (tarea.nivel + subTarea.nivel) - 1, tareaPadre: subTarea.tareaPadre};
          this.nodes.add(node);
          subTarea.tareasPrecedentes.forEach(tareaPrecedente => {
            var edge = {from: subTarea.id, to: tareaPrecedente.id};
            this.edges.add(edge);
          })

        });
        this.clusterOptionsByData={
          joinCondition: function(childOptions) {
            return childOptions.tareaPadre.id == tarea.id;
          },
          clusterNodeProperties: {
            id: tarea.id,
            borderWidth: 3,
            shape: "box",
            color: {
              border: "blue"
            },
            label: tarea.titulo,
            level: tarea.nivel,
            tareaPadre: tarea.tareaPadre
          }
        }
        this.network.cluster(this.clusterOptionsByData)


      } else{
        node = {id: tarea.id, label: tarea.titulo, level: tarea.nivel, tareaPadre: tarea.tareaPadre};
        this.nodes.add(node);
        tarea.tareasPrecedentes.forEach(tareaPrecedente => {
          var edge = {from: tarea.id, to: tareaPrecedente.id};
          this.edges.add(edge);
        })
      }*/
    });
  }

}
