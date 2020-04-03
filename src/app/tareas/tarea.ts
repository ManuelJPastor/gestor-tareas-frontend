import { Usuario } from '../usuarios/usuario';
import { Sector } from '../settings/sectores/sector';

export class Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  espacio: String;
  fechaMax: Date;
  dias: number;
  nivel: number;
  estado: String;
  sector: Sector = new Sector();
  tareaPadre: Tarea;
  tareasPrecedentes: Array<Tarea> = new Array<Tarea>();
  usuarios: Usuario[] = new Array<Usuario>();
}
