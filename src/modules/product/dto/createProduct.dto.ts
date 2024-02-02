import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReviewDto {
  @IsString()
  key: string;
  @IsString()
  value: string;
}
class Feature {
  @ApiProperty({ example: 'Name' })
  @IsOptional()
  @IsString()
  featureName: string;
  @ApiProperty({ example: 'Value' })
  @IsOptional()
  @IsString()
  featureValue: string;
}
export class CreateProductDto {
  @ApiProperty({ example: 'تست' })
  @IsNotEmpty()
  @IsString()
  title_fa: string;
  @ApiProperty({ example: 'test' })
  @IsNotEmpty()
  @IsString()
  title_en: string;
  @ApiProperty({ example: 'test' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @Type(() => ReviewDto)
  @ValidateNested({ each: true })
  review?: ReviewDto[];

  @ApiProperty({ example: '6381f6789686e603702e3a74' })
  @IsNotEmpty()
  @IsMongoId()
  brand: string;
  @ApiProperty({ example: '63830dbce174a19138b3a5fd' })
  @IsNotEmpty()
  @IsMongoId()
  category: string;
  @ApiProperty({ example: '' })
  @IsMongoId()
  @IsOptional()
  subCategory: string;
  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  score: number;
  @ApiProperty({ example: [], isArray: true, type: [String] })
  @IsNotEmpty()
  tags: string[];
  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  discount: number;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  selling_price: number;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  base_price: number;
  @ApiProperty({ example: 'SKA123' })
  @IsString()
  @IsNotEmpty()
  product_id: string;
  @ApiProperty({ example: [] })
  @IsArray()
  @IsOptional()
  images: string[];
  @ApiProperty({ example: '2022-11-06' })
  @IsNotEmpty()
  @IsISO8601()
  release_date: string;
  @ApiProperty({ example: 0 })
  @IsNumber()
  inventory: number;
  @IsArray()
  @ApiProperty({ type: [Feature] })
  @Type(() => Feature)
  @ValidateNested({ each: true })
  features: Feature[];
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  weight: number;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  height: number;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  width: number;
  @ApiProperty({ example: '638c9da3decf2286643f70ca' })
  @IsMongoId()
  @IsNotEmpty()
  depot: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  status: 0 | 1;
}
