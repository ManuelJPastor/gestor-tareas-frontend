import { Role } from './role';

export class Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  sector: string;
  roles: Role[];
}
