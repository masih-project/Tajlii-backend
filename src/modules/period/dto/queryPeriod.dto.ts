import { statusPeriod } from 'src/types/status.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class QueryPeriodDto {
  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  status: number;
}
export class PeriodResponse {
  _id: string;
  start_date: string;
  end_date: string;
  status: statusPeriod.AWAITING_PAYMENT | statusPeriod.FAILED_PAYMENT | statusPeriod.SUCCESSFUL_PAYMENT =
    statusPeriod.AWAITING_PAYMENT;
}
