import { Paso } from './paso';

export class Tarea {
  id_tarea: number;
  nombre: string;
  descripcion: string;
  fecha_max: Date;
  pasos: Paso[];

}
