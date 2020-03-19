import { Usuario } from '../usuarios/usuario';
import { Sector } from '../settings/sectores/sector';

export class Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  fechaMax: Date;
  espacio: String;
  estado: String;
  sector: Sector = new Sector();
  tareaPadre: Tarea;
  tareasPrecedentes: Array<Tarea> = new Array<Tarea>();
  usuarios: Usuario[] = new Array<Usuario>();
}
