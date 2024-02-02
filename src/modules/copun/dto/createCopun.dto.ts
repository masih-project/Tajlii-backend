import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCopunDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  value: string;
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  count: number;
  @ApiProperty({ example: '2022-11-06' })
  @IsISO8601()
  @IsString()
  start_date: string;
  @ApiProperty({ example: '2022-11-06' })
  @IsISO8601()
  @IsString()
  finish_date: string;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  type: number;
}
