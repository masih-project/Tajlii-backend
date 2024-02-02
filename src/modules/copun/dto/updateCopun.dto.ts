import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCopunDto {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  name: string;
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  value: string;
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  count: number;
  @ApiProperty({ example: '2022-11-06' })
  @IsISO8601()
  @IsString()
  @IsOptional()
  start_date: string;
  @ApiProperty({ example: '2022-11-06' })
  @IsISO8601()
  @IsString()
  @IsOptional()
  finish_date: string;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  type: number;
}
