import { Sector } from './sector';
import { Usuario } from './usuario';
import { Actor } from './actor';
import { Comentario } from './comentario';
import { Presupuesto } from './presupuesto';

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
  comentarios: Comentario[] = new Array<Comentario>();
  presupuestos: Presupuesto[] = new Array<Presupuesto>();
}
