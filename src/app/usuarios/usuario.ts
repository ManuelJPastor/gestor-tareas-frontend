import { Role } from './role';
import { Sector } from '../settings/sectores/sector';

export class Usuario {
  id: number;
  nombre: string;
  email: string;
  sector: Sector;
  roles: Role[];
}
