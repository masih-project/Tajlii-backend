import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QuerySubs {
  @ApiProperty({ example: '', required: false })
  @IsOptional()
  period: string;
}
