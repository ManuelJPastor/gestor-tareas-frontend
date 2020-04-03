import { Component, OnInit } from '@angular/core';
import { TareaService } from '../tarea.service';
import { Tarea } from '../tarea';
import * as $ from 'jquery';

@Component({
  selector: 'app-tareas-rama',
  templateUrl: './tareas-rama.component.html',
  styleUrls: ['./tareas-rama.component.css']
})
export class TareasRamaComponent implements OnInit {

private tareas:Tarea[];

constructor(private tareaService: TareaService) { }

  ngOnInit(): void {
    this.tareaService.getSubTareas(1).subscribe(tareas => {
      this.tareas = tareas;
      $(document).ready(function(){
        let items = document.getElementsByClassName("list-inline-item");
        let width = (100/items.length);
        for(var i = 0; i < items.length; i++){
          items[i].setAttribute("style", "width: "+width+"%");
        }
      })


    })
  }
}
