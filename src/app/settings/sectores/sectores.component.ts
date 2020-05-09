import { Component, OnInit } from '@angular/core';
import { Sector } from './sector';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { SectorService } from './sector.service';

@Component({
  selector: 'app-sectores',
  templateUrl: './sectores.component.html',
  styleUrls: ['./sectores.component.css']
})
export class SectoresComponent implements OnInit {

  sectores: Sector[] = new Array<Sector>();

  page_number: number = 1;
  page_size: number = 10;
  pageSizeOptions = [5, 10, 20, 50, 100];

  handlePage(e: PageEvent){
    this.page_size = e.pageSize
    this.page_number=e.pageIndex + 1
  }

  constructor(private sectorService: SectorService) { }

  ngOnInit() {
    this.sectorService.getSectores().subscribe(
      sectores => this.sectores = sectores
    );
  }

  delete(sector: Sector): void {
    Swal.fire({
      title: '¿Estas seguro?',
      text: `¿Desea eliminar el sector ${sector.sector}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '!Sí, elimínalo!'
    }).then((result) => {
      if (result.value) {
        this.sectorService.delete(sector.id).subscribe( response => {
          this.sectorService.getSectores().subscribe(sectores => this.sectores = sectores)
          Swal.fire(
            '¡Eliminado!',
            'El sector ha sido borrado.',
            'success'
          )
        })
      }
    })
  }

}
