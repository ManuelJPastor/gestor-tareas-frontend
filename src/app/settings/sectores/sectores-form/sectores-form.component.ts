import { Component, OnInit } from '@angular/core';
import { Sector } from '../sector';
import { SectorService } from '../sector.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Actor } from '../actor';

@Component({
  selector: 'app-sectores-form',
  templateUrl: './sectores-form.component.html',
  styleUrls: ['./sectores-form.component.css']
})
export class SectoresFormComponent implements OnInit {

  private sector: Sector = new Sector();
  private tituloCrear:string = "Crear Sector";
  private tituloEditar:string = "Editar Sector";

  private actorNuevo: Actor = new Actor();

  private errores: string[] = new Array<string>();

  constructor(private sectorService: SectorService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarCliente()
  }

  cargarCliente(): void{
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.sectorService.getSector(id).subscribe( sector => this.sector = sector)
      }
    })
  }

  createActor(): void{
    if(this.sector.actores.find(actor => actor.email == this.actorNuevo.email)==null){
      this.sector.actores.push(this.actorNuevo);
      this.actorNuevo=new Actor();
    } else{
      this.errores.push("Ya existe un actor con el email "+ this.actorNuevo.email);
    }
  }

  deleteActor(actor:Actor): void{
    let index = this.sector.actores.indexOf(actor);
    this.sector.actores.splice(index, 1);
    console.log(this.sector);
  }

  create(): void{
    this.sectorService.create(this.sector).subscribe(response => {
      this.router.navigate(['/settings/sectores'])
      Swal.fire('Nuevo Sector',`${response.mensaje}: ${response.sector.sector}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];
    }
    );
  }

  update(): void{
    this.sectorService.update(this.sector).subscribe(response => {
      this.router.navigate(['/settings/sectores'])
      Swal.fire('Sector Actualizado',`${response.mensaje}: ${response.sector.sector}`, 'success')
    }, err => {
      this.errores = err.error.errores as string[];
    }
    );
  }

}
