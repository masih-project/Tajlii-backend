import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdatePeriodDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  status: 0 | 1 | 2;

  @ApiProperty({ example: '2022-11-06' })
  @IsOptional()
  @IsISO8601()
  start_date: string;

  @ApiProperty({ example: '2022-11-06' })
  @IsOptional()
  @IsISO8601()
  end_date: string;
}
