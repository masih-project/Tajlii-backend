import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderType } from 'src/types/public.types';
export enum SortProduct {
  title_fa = 'title_fa',
  title_en = 'title_en',
  description = 'description',
  score = 'score',
  discount = 'discount',
  selling_price = 'selling_price',
  base_price = 'base_price',
  product_id = 'product_id',
  product_code = 'product_code',
  release_date = 'release_date',
  inventory = 'inventory',
  weight = 'weight',
  height = 'height',
  width = 'width',
  price_after_discount = 'price_after_discount',
  slug = 'slug',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}
export class QueryProduct {
  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number;
  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  min_price?: number;
  @ApiProperty({ example: 9000000, required: false })
  @IsOptional()
  @Type(() => Number)
  max_price?: number;
  @ApiProperty({ example: 'ASC', required: true, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({ example: 'price_after_discount', required: true, enum: SortProduct })
  @IsOptional()
  @IsEnum(SortProduct, { each: true })
  order_by: SortProduct;

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  brands: string[];

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  categories: string[];

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  keyword: string;
}
