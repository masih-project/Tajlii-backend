import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ButtonDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  link?: string;
}
