import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class QueryListOrderDto {
  @ApiProperty({ example: [], required: false })
  @IsOptional()
  orders?: string[];

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  delivery_method: number;
}
