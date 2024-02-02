import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { OrderType } from 'src/types/public.types';

export enum SortBrand {
  name = 'name',
  slug = 'slug',
}
export class QueryBrand {
  @ApiProperty({ example: 10, required: false })
  @IsNumberString()
  @IsOptional()
  limit: string;
  @ApiProperty({ example: 1, required: false })
  @IsNumberString()
  @IsOptional()
  skip: string;
  @ApiProperty({ example: '', required: false })
  @IsString()
  @IsOptional()
  keyword: string;

  @ApiProperty({ example: 'ASC', required: true, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({ example: 'name', required: true, enum: SortBrand })
  @IsOptional()
  @IsEnum(SortBrand, { each: true })
  order_by: SortBrand;
}
