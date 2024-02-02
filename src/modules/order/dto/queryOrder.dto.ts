import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderType } from 'src/types/public.types';
enum SortOrderByAdmin {
  code_order = 'code_order',
  status = 'status',
  delivery_method = 'delivery_method',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}
export class QueryOrderDto {
  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  type: number;
  @ApiProperty({ example: 5 })
  @IsOptional()
  limit: number;
  @ApiProperty({ example: 1 })
  @IsOptional()
  skip: number;

  @ApiProperty({ example: 'ASC', required: true, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({ example: 'message', required: true, enum: SortOrderByAdmin })
  @IsOptional()
  @IsEnum(SortOrderByAdmin, { each: true })
  order_by: SortOrderByAdmin;
}
export class OrderResponse {}
