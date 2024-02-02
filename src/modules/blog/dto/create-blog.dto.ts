import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  coverImageUrl: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  summary: string;

  @ApiProperty({ example: [], isArray: true, type: [String] })
  @IsNotEmpty()
  tags: string[];

  @ApiProperty({ example: [] })
  @IsArray()
  @IsOptional()
  images: string[];

  @ApiProperty({ example: '2022-11-06' })
  @IsNotEmpty()
  @IsISO8601()
  releaseDate: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  status: 0 | 1;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  readingTime: string;

  @ApiProperty({ example: '' })
  @IsMongoId()
  category: string;
}
