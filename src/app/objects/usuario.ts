import { Role } from './role';
import { Sector } from './sector';

export class Usuario {
  id: number;
  nombre: string='';
  email: string;
  password: string;
  sector: Sector = new Sector();
  roles: Role[] = [new Role()];
}
