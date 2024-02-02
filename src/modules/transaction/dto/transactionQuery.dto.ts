import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderType } from 'src/types/public.types';
export enum SortTransaction {
  cardHash = 'cardHash',
  refID = 'refID',
  amount = 'amount',
  authority = 'authority',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}
export class TransactionQueryDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @ApiProperty({ example: 'ASC', required: true, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({ example: 'message', required: true, enum: SortTransaction })
  @IsOptional()
  @IsEnum(SortTransaction, { each: true })
  order_by: SortTransaction;
}
