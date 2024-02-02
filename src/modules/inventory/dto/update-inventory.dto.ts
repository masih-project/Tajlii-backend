import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class updateInventoryDto {
  @ApiProperty({})
  @IsNotEmpty()
  count: number;
}
