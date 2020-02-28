import { Usuario } from '../usuarios/usuario';

export class Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_max: Date;
  espacio: String;
  estado: String;
  usuarios: Usuario[];
}
