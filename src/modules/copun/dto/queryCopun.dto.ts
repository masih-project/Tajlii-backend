import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { OrderType } from 'src/types/public.types';
enum SortCopun {
  name = 'name',
  value = 'value',
  type = 'type',
  count = 'count',
  start_date = 'start_date',
  finish_date = 'finish_date',
  count_used = 'count_used',
}
export class QueryCopunDto {
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

  @ApiProperty({ example: 'name', required: true, enum: SortCopun })
  @IsOptional()
  @IsEnum(SortCopun, { each: true })
  order_by: SortCopun;
}
