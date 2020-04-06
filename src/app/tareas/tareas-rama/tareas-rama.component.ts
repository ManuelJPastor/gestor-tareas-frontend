import { Component, OnInit } from '@angular/core';
import { TareaService } from '../tarea.service';
import { Tarea } from '../tarea';
import * as $ from 'jquery';
import { Network, DataSet } from 'vis';

@Component({
  selector: 'app-tareas-rama',
  templateUrl: './tareas-rama.component.html',
  styleUrls: ['./tareas-rama.component.css']
})
export class TareasRamaComponent implements OnInit {

private tareas:Tarea[];
private nodes;

constructor(private tareaService: TareaService) { }

  ngOnInit(): void {
    this.tareaService.getSubTareas(1).subscribe(tareas => {
      this.tareas = tareas;

      var nodes = new DataSet([
          {id: 2, label: 'Cambiar bombillas 1 asdf asdf asdf asdf adfd d d d d asdfa', level:1},
          {id: 3, label: 'Cambiar bombillas 1 asdf asdf asdf asdf adfd d d d d asdfa', level:1},
          {id: 4, label: 'Cambiar bombillas 1 asdf asdf asdf asdf adfd d d d d asdfa', level:2},
          {id: 5, label: 'Cambiar bombillas 1 asdf asdf asdf asdf adfd d d d d asdfa', level:2},
          {id: 6, label: 'Cambiar bombillas 1 asdf asdf asdf asdf adfd d d d d asdfa', level:3},
          {id: 7, label: 'Cambiar bombillas 1 asdf asdf asdf asdf adfd d d d d asdfa', level:4}
        ]);

        // create an array with edges
        var edges = new DataSet([
          {from: 4, to: 2},
          {from: 4, to: 3},
          {from: 5, to: 3},
          {from: 6, to: 4},
          {from: 7, to: 6},
          {from: 7, to: 3}
        ]);

        // create a network
        var container = document.getElementById('mynetwork');
        var data = {
          nodes: nodes,
          edges: edges
        };

        var options = {
          autoresize: true,
          width: '100%',
          height: (window.innerHeight - 75) + "px",
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
            multiselect: true,
            zoomView: false,
            selectConnectedEdges: false
          },
          configure: {
            showButton: true
          },
          locale: 'es',
          manipulation: {
            enabled: true,
            initiallyActive: false,
            addNode: true,
            addEdge: true,
            editNode: undefined,
            editEdge: true,
            deleteNode: true,
            deleteEdge: true,
            controlNodeStyle:{
              // all node options are valid.
            }
          }

        };

        var network = new Network(container, data, options);

        network.on("stabilizationIterationsDone", function () {
            network.setOptions( { physics: false } );
        });

    })
  }

}
