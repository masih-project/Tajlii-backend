import { OrderType } from '@$/types/public.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum SortRewardByAdmin {
  type = 'type',
  price_reward = 'price_reward',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export class QueryRewardDto {
  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  type: number;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  period: string;

  @ApiProperty({ example: 5 })
  @IsOptional()
  limit: number;
  @ApiProperty({ example: 1 })
  @IsOptional()
  skip: number;

  @ApiProperty({ example: 'ASC', required: false, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({ required: false, enum: SortRewardByAdmin })
  @IsOptional()
  @IsEnum(SortRewardByAdmin, { each: true })
  order_by: SortRewardByAdmin;
}
