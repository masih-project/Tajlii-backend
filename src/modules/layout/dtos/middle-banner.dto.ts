import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MiddleBannerDto {
  @IsNotEmpty()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  mobileImage?: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  buttonLink: string;
}
