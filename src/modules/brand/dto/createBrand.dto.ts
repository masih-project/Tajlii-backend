import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: '', type: 'string' })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({ example: '', type: 'string' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ example: '', type: 'string' })
  @IsString()
  @IsOptional()
  img_url: string
}
