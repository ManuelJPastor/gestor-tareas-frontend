import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Usuario } from '../objects/usuario';
import { Role } from '../objects/role';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private urlToken = 'http://localhost:8080/token'

  private urlRoles = 'http://localhost:8080/api/roles'

  private urlEndPoint:string = 'http://localhost:8080/api/usuarios';

  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'
 });

  constructor(private http: HttpClient, private router: Router) {
    /*http.get(this.urlToken).subscribe(data => {
      const token = data['token'];
      this.httpHeaders = new HttpHeaders({'Content-Type':'application/json',
      'X-Auth-Token':token
     });
   }, () => {});*/
  }

  getUsuario(id): Observable<Usuario>{
    return this.http.get<Usuario>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/usuarios']);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  getUsuarios(): Observable<Usuario[]> {
    //return of(USUARIOS);
    return this.http.get<Usuario[]>(this.urlEndPoint, {headers: this.httpHeaders});
  }

  create(usuario: Usuario) : Observable<any> {
    return this.http.post<any>(this.urlEndPoint, usuario, {headers: this.httpHeaders}).pipe(
      catchError(e => {

        if(e.status==400){
          return throwError(e);
        }

        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  update(usuario: Usuario) : Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${usuario.id}`, usuario, {headers: this.httpHeaders}).pipe(
      catchError(e => {

        if(e.status==400){
          return throwError(e);
        }

        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  delete(id): Observable<void>{
    return this.http.delete<void>(`${this.urlEndPoint}/${id}`, {headers: this.httpHeaders}).pipe(
      catchError(e => {
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  getUsuariosByEmail(email): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.urlEndPoint}/email/${email}`, {headers: this.httpHeaders});
  }

  getUsuariosBySector(id): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.urlEndPoint}/sector/${id}`, {headers: this.httpHeaders});
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.urlRoles, {headers: this.httpHeaders});
  }
}
