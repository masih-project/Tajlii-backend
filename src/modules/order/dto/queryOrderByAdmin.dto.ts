import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { DeliveryMethod, OrderType } from 'src/types/public.types';
enum SortOrderByAdmin {
  code_order = 'code_order',
  status = 'status',
  delivery_method = 'delivery_method',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}
export class QueryOrderByAdmin {
  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  limit: number;
  @ApiProperty({ example: 1, required: false })
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

  @IsOptional()
  @IsEnum(DeliveryMethod)
  delivery_method?: DeliveryMethod;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsInt()
  status_transaction?: number;

  @IsOptional()
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  dateTo?: Date;

  @IsOptional()
  @IsInt()
  scoreFrom?: number;

  @IsOptional()
  @IsInt()
  scoreTo?: number;

  @IsOptional()
  @IsInt()
  priceFrom?: number;

  @IsOptional()
  @IsInt()
  priceTo?: number;

  @IsOptional()
  @IsString()
  code_order?: string;
}
