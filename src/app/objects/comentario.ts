import { Usuario } from './usuario';
import { Tarea } from './tarea';

export class Comentario {
  id: number;
  comentario: string;
  tarea: Tarea;
  usuario: Usuario = new Usuario();
  createAt: Date;
}
