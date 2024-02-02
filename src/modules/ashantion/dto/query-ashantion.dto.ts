import { OrderType } from '@$/types/public.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';

export const AshantionSortItems = <const>[
  'product_count',
  'ashantion_count',
  'max_count_ashantion',
  'count_used',
  'createdAt'
];
export type AccumulativeSortType = (typeof AshantionSortItems)[number];
export class QueryAshantionDto {
  @ApiProperty({ example: 10, required: false })
  @IsNumberString()
  @IsOptional()
  limit: string;
  
  @ApiProperty({ example: 1, required: false })
  @IsNumberString()
  @IsOptional()
  skip: string;

  @ApiProperty({ example: 'ASC', required: true, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({  required: true, enum: AshantionSortItems })
  @IsOptional()
  @IsEnum(AshantionSortItems, { each: true })
  order_by: AccumulativeSortType;
}
