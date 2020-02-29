import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { Tarea } from './tarea';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TareaService {

  private urlEndPoint:string = 'http://localhost:8080/api/tareas';

  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'
 });

  constructor(private http: HttpClient, private router: Router) {
  }

  getTarea(id): Observable<Tarea>{
    return this.http.get<Tarea>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/tareas']);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  getTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(this.urlEndPoint, {headers: this.httpHeaders});
  }

  getMisTareas(id): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.urlEndPoint}/mistareas/${id}`, {headers: this.httpHeaders});
  }

  create(tarea: Tarea) : Observable<any> {
    return this.http.post<any>(this.urlEndPoint, tarea, {headers: this.httpHeaders}).pipe(
      catchError(e => {

        if(e.status==400){
          return throwError(e);
        }

        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  update(tarea: Tarea) : Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${tarea.id}`, tarea, {headers: this.httpHeaders}).pipe(
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

  getSectores(): Observable<string[]>{
    return this.http.get<string[]>(this.urlEndPoint+'/sectores', {headers: this.httpHeaders});
  }
}
