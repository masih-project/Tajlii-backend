import { City } from './city.interface';
export interface Province {
  _id: string;
  name: string;
  cities: City[];
}
