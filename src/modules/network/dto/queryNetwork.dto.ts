import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class QueryNetwork {
  @ApiProperty({ example: '', required: false })
  @IsOptional()
  user: string;

  @ApiProperty({ example: '', required: false })
  @IsMongoId()
  @IsOptional()
  period: string;
}
