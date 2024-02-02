import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { ObjectId } from 'mongodb';
export class CartProduct {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  product_id: string;
  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  count: number;
}
export class CreateListCart {
  @IsArray()
  @ApiProperty({ type: [CartProduct] })
  @Type(() => CartProduct)
  @ValidateNested({ each: true })
  items: CartProduct[];
}
