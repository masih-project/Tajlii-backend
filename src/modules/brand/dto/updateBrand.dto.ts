import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  name: string;
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty({ example: '', type: 'string' })
  @IsString()
  @IsOptional()
  img_url: string;
  
}
