import { DeliveryMethod } from '@$/types/public.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateProductDto } from 'src/modules/product/dto/createProduct.dto';
import { statusOrder, statusShipping } from 'src/types/status.types';

export class ProductBasket extends CreateProductDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  product_code: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  price_after_discount: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  count_sales: number;
}
export class Basket {
  @ApiProperty({ type: ProductBasket })
  @Type(() => ProductBasket)
  @ValidateNested({ each: true })
  product: ProductBasket;

  @ApiProperty({ type: Number, default: 0 })
  @IsNotEmpty()
  count: number;
}

export class UpdateOrderByAdmin {
  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  count_product: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  shipment_number: number;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  shipment_tracking_code: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsEnum(statusOrder, { each: true })
  @IsNumber()
  status: statusOrder;

  @ApiProperty({})
  @IsOptional()
  @IsEnum(statusShipping, { each: true })
  @IsNumber()
  statusShipping: statusShipping;

  @ApiProperty({})
  @IsOptional()
  period: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsEnum(DeliveryMethod, { each: true })
  @IsNumber()
  delivery_method: DeliveryMethod;

  @ApiProperty({ default: null })
  @IsOptional()
  address: object;

  @ApiProperty({ type: [Basket] })
  @Type(() => Basket)
  @ValidateNested({ each: true })
  baskets: Basket[];
}
