import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  product_id: string;
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  comment: string;
  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  parent: string;
}
