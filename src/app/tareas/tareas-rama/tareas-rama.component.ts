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

constructor(private tareaService: TareaService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.tareaService.getRamaTareas(id).subscribe(tareas => {
          tareas;

          var nodes = new DataSet<any>();
          var edges = new DataSet<any>();

          tareas.forEach(tarea => {
            var node;
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
            })
          })

            // create a network
            var container = document.getElementById('mynetwork');
            var data = {
              nodes: nodes,
              edges: edges
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
              manipulation: {
                enabled:true
              }
            };

            var network = new Network(container, data, options);
            network.on('doubleClick', (event)=> {
              var nodos = event.nodes
              if(nodos.length!=0){
                this.router.navigate(['/tareas/form',nodos[0]])
              }
            })
        })
      }
    })
  }

}
