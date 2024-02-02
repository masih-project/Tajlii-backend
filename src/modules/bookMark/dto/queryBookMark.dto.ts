import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class QueryBookMark {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number;
}
