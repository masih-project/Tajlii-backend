import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCommentBlogDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  status: 0 | 1 | 2;
}
