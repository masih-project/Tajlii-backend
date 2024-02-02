import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateCategoryDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  slug: string;
  @ApiProperty({ example: '' })
  @IsOptional()
  parent: mongoose.Types.ObjectId;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  img_url: string;

  @ApiProperty({ example: [], type: [String] })
  @IsOptional({ each: true })
  @IsString({ each: true })
  brands: string[];


  @ApiProperty({})
  @IsOptional()
  @IsString()
  description?: string


  @ApiProperty({})
  @IsOptional()
  @IsString()
  imgUrl?: string
}
