import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyCopunOrderDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  order_id: string;
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  copun: string;
}
