import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { catchError, filter, map } from 'rxjs/operators';
import { Tarea } from '../objects/tarea';
import { Comentario } from '../objects/comentario';

@Injectable({
  providedIn: 'root'
})
export class TareaService {

  private urlEndPoint:string = 'http://localhost:8080/api/tareas';

  private urlEndPointComentarios:string = 'http://localhost:8080/api/comentarios';

  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'
 });

  constructor(private http: HttpClient, private router: Router) {
  }

  getTarea(id): Observable<Tarea>{
    return this.http.get<Tarea>(`${this.urlEndPoint}/${id}`);
  }

  getTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(this.urlEndPoint, {headers: this.httpHeaders});
  }

  getMisTareas(email): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.urlEndPoint}/mistareas/${email}`, {headers: this.httpHeaders});
  }

  getTareasPadre(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.urlEndPoint}/tareasPadre`, {headers: this.httpHeaders});
  }

  getSubTareas(id): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.urlEndPoint}/subTareas/${id}`, {headers: this.httpHeaders});
  }

  getRamaTareas(id): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.urlEndPoint}/ramaTareas/${id}`, {headers: this.httpHeaders});
  }

  getTareasPrecedentes(id): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.urlEndPoint}/tareasPrecedentes/${id}`, {headers: this.httpHeaders});
  }

  getComentarios(idTarea): Observable<Comentario[]>{
    return this.http.get<Comentario[]>(`${this.urlEndPointComentarios}/tarea/${idTarea}`, {headers: this.httpHeaders});
  }

  crearComentario(comentario: Comentario): Observable<any> {
    return this.http.post<any>(this.urlEndPointComentarios, comentario, {headers: this.httpHeaders}).pipe(
      catchError(e => {

        if(e.status==400){
          return throwError(e);
        }

        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  eliminarComentario(id): Observable<void>{
    return this.http.delete<void>(`${this.urlEndPointComentarios}/${id}`, {headers: this.httpHeaders}).pipe(
      catchError(e => {
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
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

  getEstados(): Observable<string[]>{
    return this.http.get<string[]>(this.urlEndPoint+'/estados', {headers: this.httpHeaders});
  }
}
