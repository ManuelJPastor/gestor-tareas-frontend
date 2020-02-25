import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Bienvenido al Gestor de Tareas';
  empresa : string = 'Ucam';
  nombre = 'Manuel';
}
