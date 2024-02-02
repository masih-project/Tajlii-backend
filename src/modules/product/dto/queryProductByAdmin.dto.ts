import { statusProduct } from '@$/types/status.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderType } from 'src/types/public.types';
enum SortProductByAdmin {
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
}
export class QueryProductByAdmin {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number;
  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  @Type(() => String)
  keyword?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minWidth: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxWidth: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minHeight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxHeight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minWeight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxWeight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  inventory: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  product_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  product_code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title_fa: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title_en: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minDiscount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxDiscount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minSellingPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxSellingPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minPriceAfterDiscount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxPriceAfterDiscount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minCountSales: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxCountSales: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minScore: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxScore: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minInventory: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxInventory: number;

  @IsOptional()
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  dateTo?: Date;

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  brands: string[];

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  categories: string[];

  @ApiProperty({
    example: statusProduct.CANCELED,
    required: false,
    enumName: 'status',
    enum: statusProduct,
  })
  @IsOptional()
  @IsEnum(statusProduct, { each: true })
  status: statusProduct[];

  @ApiProperty({ example: 'ASC', required: true, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({ example: 'price_after_discount', required: true, enum: SortProductByAdmin })
  @IsOptional()
  @IsEnum(SortProductByAdmin, { each: true })
  order_by: SortProductByAdmin;
}
