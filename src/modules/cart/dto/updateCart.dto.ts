import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateCart {
  @ApiProperty({ example: 0 })
  @IsNumber()
  count: number;
}
