import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderType } from 'src/types/public.types';
enum SortSkanetUser {
  email = 'email',
  mobile = 'mobile',
  status = 'status',
  marketer_code = 'marketer_code',
  date_expired = 'date_expired',
}
export class QuerySkanetUser {
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

  @ApiProperty({ example: 'email', required: true, enum: SortSkanetUser })
  @IsOptional()
  @IsEnum(SortSkanetUser, { each: true })
  order_by: SortSkanetUser;
}
