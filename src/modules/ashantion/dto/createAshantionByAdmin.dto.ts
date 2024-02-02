import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAshantionByAdminDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  product: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  product_count: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  ashantion_count: number;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  product_ashantion: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  max_count_ashantion: number;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  depot: string;
}
