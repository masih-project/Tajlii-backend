import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsISO8601 } from 'class-validator';

export class UpdateRewardByAdminDto {
  @ApiProperty({ example: '2022-11-06' })
  @IsOptional()
  @IsISO8601()
  start_date: string;

  @ApiProperty({ example: '2022-11-06' })
  @IsOptional()
  @IsISO8601()
  end_date: string;
}
