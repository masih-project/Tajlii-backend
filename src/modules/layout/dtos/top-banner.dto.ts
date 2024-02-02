import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TopBannerDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
