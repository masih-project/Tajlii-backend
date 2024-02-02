import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateAshantionByAdminDto {
  @ApiProperty({ example: '' })
  @IsOptional()
  product: string;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  product_count: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  ashantion_count: number;

  @ApiProperty({ example: '' })
  @IsOptional()
  product_ashantion: string;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  max_count_ashantion: number;

  @ApiProperty({ example: '' })
  @IsOptional()
  depot: string;
}
