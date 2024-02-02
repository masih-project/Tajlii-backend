import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryBlogDto {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  name: string;
}
