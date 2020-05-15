import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  /*authenticated = false;
  endPoint = "http://localhost:8080"

  constructor(private http: HttpClient) {
  }

  authenticate(credentials, callback) {

        const headers = new HttpHeaders(credentials ? {
            Authorization : 'Basic ' + window.btoa(credentials.username + ':' + credentials.password)
        } : {});

        this.http.get(this.endPoint+'/user', {headers: headers}).subscribe(response => {
            if (response['name']) {
                this.authenticated = true;
            } else {
                this.authenticated = false;
            }
            return callback && callback();
        });

    }*/

  USER_NAME_SESSION_ATTRIBUTE_NAME = 'authenticatedUser'
  ROLE = 'role'
  AUTHORIZATION = 'authorization'

  constructor(private http: HttpClient, private router: Router) {

  }

  authenticationService(username: String, password: String) {
    let authorization = this.createBasicAuthToken(username, password);
    return this.http.get('http://localhost:8080/user', { headers: { authorization: authorization } }).pipe(map((res) => {
        this.registerSuccessfulLogin(res['name'], res['authorities'], authorization);
      }));
  }

  createBasicAuthToken(username: String, password: String) {
    return 'Basic ' + window.btoa(username + ":" + password)
  }

  registerSuccessfulLogin(username, authorities, authorization) {
    sessionStorage.setItem(this.USER_NAME_SESSION_ATTRIBUTE_NAME, username)
    let admin: boolean = false;
    authorities.forEach(authority => {
      if(authority.authority == "ADMIN"){
        admin = true;
      }
    })
    if(admin){
      sessionStorage.setItem(this.ROLE, "ADMIN");
    } else{
      sessionStorage.setItem(this.ROLE, "USER");
    }
    sessionStorage.setItem(this.AUTHORIZATION, authorization);

  }

  logout() {
    sessionStorage.removeItem(this.USER_NAME_SESSION_ATTRIBUTE_NAME);
    sessionStorage.removeItem(this.ROLE);
    sessionStorage.removeItem(this.AUTHORIZATION);
    this.router.navigate(['/login']);
  }

  isUserLoggedIn() {
    let user = sessionStorage.getItem(this.USER_NAME_SESSION_ATTRIBUTE_NAME)
    if (user === null){
      return false
    } else{
      return true
    }
  }

  getLoggedInUserName() {
    let user = sessionStorage.getItem(this.USER_NAME_SESSION_ATTRIBUTE_NAME)
    if (user === null) return ''
    return user
  }

  isAdmin(){
    if(this.isUserLoggedIn()){
      let role = sessionStorage.getItem(this.ROLE);
      if(role == "ADMIN"){
        return true;
      } else{
        return false;
      }
    }
    return false;

  }

  isUser(){
    if(this.isUserLoggedIn()){
      return true;
    }
    return false;
  }

  getAuthorization(){
    return sessionStorage.getItem(this.AUTHORIZATION);
  }
}
