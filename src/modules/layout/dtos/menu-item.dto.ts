import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class MenuItemDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ default: [], type: MenuItemDto })
  @Type(() => MenuItemDto)
  @ValidateNested({ each: true })
  submenus?: MenuItemDto[];
}
