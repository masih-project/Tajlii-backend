import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MenuItemDto } from './menu-item.dto';

export class FooterDto {
  @IsString()
  logo: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString({ each: true })
  certificates?: string[];

  @Type(() => GroupMenuDto)
  @ValidateNested({ each: true })
  menus: GroupMenuDto[];
}

class GroupMenuDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @Type(() => MenuItemDto)
  @ValidateNested({})
  items: MenuItemDto[];
}
