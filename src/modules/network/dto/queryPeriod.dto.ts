import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class QueryPeriodDto {
  @ApiProperty({ example: '' })
  @IsMongoId()
  @IsNotEmpty()
  period: string;
}
