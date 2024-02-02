import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderType } from 'src/types/public.types';
export enum SortCommentByAdmin {
  comment = 'comment',
  status = 'status',
  createdAt = 'createdAt',
}
export class QueryCommentByAdmin {
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

  @ApiProperty({ example: 'comment', required: true, enum: SortCommentByAdmin })
  @IsOptional()
  @IsEnum(SortCommentByAdmin, { each: true })
  order_by: SortCommentByAdmin;
}
