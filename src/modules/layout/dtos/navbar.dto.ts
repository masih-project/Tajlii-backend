import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MenuItemDto } from './menu-item.dto';

export class NavbarDto {
  @IsString()
  logo: string;

  @Type(() => MenuItemDto)
  @ValidateNested({ each: true })
  items: MenuItemDto[];

  @IsString()
  phone: string;
}
