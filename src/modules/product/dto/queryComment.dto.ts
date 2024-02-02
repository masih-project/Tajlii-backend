import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class QueryComment {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number;
  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  @Type(() => String)
  keyword?: string;
}
