import { Component } from '@angular/core';
import { AuthenticationService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Bienvenido al Gestor de Tareas';
  empresa : string = 'Ucam';
  nombre = 'Manuel';

  constructor(private auth: AuthenticationService){

  }

}
