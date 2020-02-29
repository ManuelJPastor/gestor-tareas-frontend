import { Usuario } from '../usuarios/usuario';

export class Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  fechaMax: Date;
  espacio: String;
  estado: String;
  usuarios: Usuario[];
}
