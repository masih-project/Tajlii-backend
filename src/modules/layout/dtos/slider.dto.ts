import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SliderDto {
  @IsNotEmpty()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  mobileImage?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  link?: string;
}
