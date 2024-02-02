import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { OrderType } from 'src/types/public.types';
enum SortTicketByAdmin {
  message = 'message',
  subject = 'subject',
  ticket_code = 'ticket_code',
  createdAt = 'createdAt',
}
export class QueryTicketByAdmin {
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

  @ApiProperty({ example: 'message', required: true, enum: SortTicketByAdmin })
  @IsOptional()
  @IsEnum(SortTicketByAdmin, { each: true })
  order_by: SortTicketByAdmin;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsInt()
  status: number;
}
