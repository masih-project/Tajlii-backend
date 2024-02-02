import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderType } from 'src/types/public.types';
enum SortTicket {
  message = 'message',
  subject = 'subject',
  ticket_code = 'ticket_code',
  createdAt = 'createdAt',
}
export class QueryTicket {
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

  @ApiProperty({ example: 'message', required: true, enum: SortTicket })
  @IsOptional()
  @IsEnum(SortTicket, { each: true })
  order_by: SortTicket;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  type: number;
}
