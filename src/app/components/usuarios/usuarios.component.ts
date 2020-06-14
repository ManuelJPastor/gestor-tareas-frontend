import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { PageEvent } from '@angular/material/paginator';
import { AuthenticationService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/objects/usuario';
import { Sector } from 'src/app/objects/sector';
import { SectorService } from 'src/app/services/sector.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios: Usuario[] = new Array<Usuario>();
  usuariosAll: Usuario[] = new Array<Usuario>();

  sectores : Sector[] = new Array<Sector>();

  page_number: number = 1;
  page_size: number = 10;
  pageSizeOptions = [5, 10, 20, 50, 100];

  handlePage(e: PageEvent){
    this.page_size = e.pageSize
    this.page_number=e.pageIndex + 1
  }

  constructor(private usuarioService: UsuarioService, private sectorService: SectorService, private authService: AuthenticationService) { }

  ngOnInit() {
    this.usuarioService.getUsuarios().subscribe(usuarios => {
        this.usuarios = usuarios;
        this.usuariosAll = usuarios;
    });
    this.sectorService.getSectores().subscribe(
      sectores => this.sectores = sectores
    )
  }

  busqueda(){
    var busqueda = document.getElementById("busqueda").value;
    var sector = document.getElementById("sector").value;
    this.usuarios = this.usuariosAll.filter(usuario => usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())|| usuario.email.toLowerCase().includes(busqueda.toLowerCase()));
    if(sector!="Todos"){
      this.usuarios = this.usuarios.filter(usuario => usuario.sector.sector == sector);
    }
  }

  authenticated() {
    return this.authService.isUserLoggedIn();
  }

  ordenar(): void{
    this.usuarios.sort((a,b) => b.nombre.localeCompare(a.nombre));
  }

  delete(usuario: Usuario): void {
    Swal.fire({
      title: '¿Estas seguro?',
      text: `¿Desea eliminar el usuario ${usuario.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '!Sí, elimínalo!'
    }).then((result) => {
      if (result.value) {
        this.usuarioService.delete(usuario.id).subscribe( response => {
          this.usuarioService.getUsuarios().subscribe(usuarios => this.usuarios = usuarios)
          Swal.fire(
            '¡Eliminado!',
            'El usuario ha sido borrado.',
            'success'
          )
        })
      }
    })
  }

}
