import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators'
import { AuthenticationService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/objects/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  title = 'Gestor de tareas';
  usuarioLogged: Usuario = new Usuario();

  constructor(private router: Router, private authenticationService: AuthenticationService, private http: HttpClient, private usuarioService: UsuarioService){
  }

  ngOnInit(){
    this.usuarioService.getUsuariosByEmail(this.authenticationService.getLoggedInUserName()).subscribe(usuario => {
      this.usuarioLogged = usuario;
    })
  }

  logout() {
      this.authenticationService.logout();
  }
}
