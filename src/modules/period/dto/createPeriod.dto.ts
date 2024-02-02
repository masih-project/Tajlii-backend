import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsOptional } from 'class-validator';
export class CreatePeriodDto {
  @ApiProperty({ example: '2022-11-06' })
  @IsOptional()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: '2022-11-06' })
  @IsNotEmpty()
  @IsISO8601()
  end_date: string;
}
