import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../login/auth.service';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  title = 'Gestor de tareas'
  endPoint = "http://localhost:8080"

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private http: HttpClient){
    //this.authenticationService.authenticate(undefined, undefined);
  }

  /*logout() {
      this.http.post(this.endPoint+'/logout', {}).pipe(finalize(() => {
          this.authenticationService.authenticated = false;
          this.router.navigateByUrl('/login');
      })).subscribe();
  }*/
}
