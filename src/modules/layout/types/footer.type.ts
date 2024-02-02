import { MenuItem } from './menu-item.type';

export class Footer {
  logo: string;
  description: string;
  certificates: string[];
  menus: {
    name: string;
    items: MenuItem[];
  };
}
