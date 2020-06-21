import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { catchError, filter, map } from 'rxjs/operators';
import { Presupuesto } from '../objects/presupuesto';
import { Comentario } from '../objects/comentario';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {

  private urlEndPoint:string = 'http://localhost:8080/api/presupuestos';

  private httpHeaders = new HttpHeaders({'Content-Type':'multipart/form-data'
 });

  constructor(private http: HttpClient, private router: Router) {
  }

  getPresupuesto(id): Observable<Presupuesto>{
    return this.http.get<Presupuesto>(`${this.urlEndPoint}/${id}`);
  }

  getPresupuestosTarea(id): Observable<Presupuesto[]> {
    return this.http.get<Presupuesto[]>(`${this.urlEndPoint}/tarea/${id}`);
  }

  create(file: File, id: number) : Observable<any> {
    const formData = new FormData();
    formData.append('file',file);
    return this.http.post<any>(`${this.urlEndPoint}/${id}`, formData).pipe(
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

  downloadPresupuesto(id){
    return this.http.get(`${this.urlEndPoint}/download/${id}`, { responseType:'blob' });
  }
}
