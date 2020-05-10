import { Usuario } from '../usuarios/usuario';
import { Sector } from '../settings/sectores/sector';
import { Actor } from '../settings/sectores/actor';

export class Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  espacio: String;
  fechaMax: Date;
  dias: number;
  nivel: number;
  estado: String;
  diasAviso: number = 0;
  diasAviso2: number = 0;
  sector: Sector = new Sector();
  tareaPadre: Tarea
  subTareas: Array<Tarea> = new Array<Tarea>();
  tareasPrecedentes: Array<Tarea> = new Array<Tarea>();
  usuarios: Usuario[] = new Array<Usuario>();
  actores: Actor[] = new Array<Actor>();
}
