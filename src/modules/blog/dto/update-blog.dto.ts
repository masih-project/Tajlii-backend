import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBlogDto {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  coverImageUrl: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  content: string;

  @ApiProperty({ example: [], isArray: true, type: [String] })
  @IsOptional()
  tags: string[];

  @ApiProperty({ example: [] })
  @IsArray()
  @IsOptional()
  images: string[];

  @ApiProperty({ example: '2022-11-06' })
  @IsOptional()
  @IsISO8601()
  releaseDate: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  status: 0 | 1;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  readingTime: string;

  @ApiProperty({ example: '' })
  @IsMongoId()
  @IsOptional()
  category: string;

  @ApiProperty({})
  @IsOptional()
  @IsString()
  summary: string;
}
