import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  comment: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  status: 0 | 1 | 2;
}
