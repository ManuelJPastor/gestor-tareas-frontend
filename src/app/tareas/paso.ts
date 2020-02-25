import { Usuario } from '../usuarios/usuario';

export class Paso {
  id_paso: number;
  id_tarea: number;
  usuario_aviso: Usuario;
  nombre: string;
  estado: string;
  fecha_max: Date;
}
