import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentBlogDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsString()
  blogId: string;

  @ApiProperty({})
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({})
  @IsOptional()
  @IsString()
  parentId: string
}
