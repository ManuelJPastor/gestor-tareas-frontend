import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password : string;
  errorMessage = 'Invalid Credentials';
  successMessage: string;
  invalidLogin = false;
  loginSuccess = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private http: HttpClient){

    }

  ngOnInit() {
  }

  //Envío del formulario login
  handleLogin() {
    this.authenticationService.authenticationService(this.username, this.password).subscribe((result)=> {
      this.invalidLogin = false;
      this.loginSuccess = true;
      this.successMessage = 'Login Successful.';
      this.router.navigate(['/tareas']);
    }, () => {
      this.invalidLogin = true;
      this.loginSuccess = false;
    });
  }
  
  //Cierre de sesión
  logout(){
    this.authenticationService.logout();
  }
}
