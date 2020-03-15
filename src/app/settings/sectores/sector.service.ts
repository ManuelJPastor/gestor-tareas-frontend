import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Sector } from './sector';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SectorService {
  private urlEndPoint:string = 'http://localhost:8080/api/sectores';

  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'
 });

  constructor(private http: HttpClient, private router: Router) {
      this.httpHeaders = new HttpHeaders({'Content-Type':'application/json',
     });
  }

  getSector(id): Observable<Sector>{
    return this.http.get<Sector>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/settings/sectores']);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  getSectores(): Observable<Sector[]> {
    return this.http.get<Sector[]>(this.urlEndPoint, {headers: this.httpHeaders});
  }

  create(sector: Sector) : Observable<any> {
    return this.http.post<any>(this.urlEndPoint, sector, {headers: this.httpHeaders}).pipe(
      catchError(e => {

        if(e.status==400){
          return throwError(e);
        }

        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  update(sector: Sector) : Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${sector.id}`, sector, {headers: this.httpHeaders}).pipe(
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
}
