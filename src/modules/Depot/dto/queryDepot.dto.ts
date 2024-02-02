import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderType } from 'src/types/public.types';
export enum SortDepot {
  title = 'title',
  phone = 'phone',
  address = 'address',
  status = 'status',
}
export class QueryDepot {
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

  @ApiProperty({ example: 'ASC', required: true, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({ example: 'title', required: true, enum: SortDepot })
  @IsOptional()
  @IsEnum(SortDepot, { each: true })
  order_by: SortDepot;
}
