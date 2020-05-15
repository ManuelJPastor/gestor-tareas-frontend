import { Actor } from './actor';

export class Sector {
  id: number;
  sector: string;
  actores: Actor[] = new Array<Actor>();
}
