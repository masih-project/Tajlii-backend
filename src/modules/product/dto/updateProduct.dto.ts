import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsISO8601,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ReviewDto } from './createProduct.dto';
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
export class UpdateProductByAdmin {
  @ApiProperty({ example: 'تست' })
  @IsOptional()
  @IsString()
  title_fa: string;
  @ApiProperty({ example: 'test' })
  @IsOptional()
  @IsString()
  title_en: string;
  @ApiProperty({ example: 'test' })
  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @Type(() => ReviewDto)
  @ValidateNested({ each: true })
  review?: ReviewDto[];

  @ApiProperty({ example: '6381f6789686e603702e3a74' })
  @IsOptional()
  @IsMongoId()
  brand: string;
  @ApiProperty({ example: '63830dbce174a19138b3a5fd' })
  @IsOptional()
  @IsMongoId()
  category: string;
  @ApiProperty({ example: '' })
  @IsMongoId()
  @IsOptional()
  subCategory: string;
  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  score: number;
  @ApiProperty({ example: [], isArray: true, type: [String] })
  @IsOptional()
  tags: string[];
  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  discount: number;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  selling_price: number;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  base_price: number;
  @ApiProperty({ example: 'SKA123' })
  @IsString()
  @IsOptional()
  product_id: string;
  @ApiProperty({ example: [] })
  @IsArray()
  @IsOptional()
  images: string[];
  @ApiProperty({ example: '2022-11-06' })
  @IsOptional()
  @IsISO8601()
  release_date: string;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  inventory: number;
  @IsArray()
  @ApiProperty({ type: [Feature] })
  @Type(() => Feature)
  @ValidateNested({ each: true })
  @IsOptional()
  features: Feature[];
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
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
  @IsOptional()
  depot: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  status: 0 | 1;
}
