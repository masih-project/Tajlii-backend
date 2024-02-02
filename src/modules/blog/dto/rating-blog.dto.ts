import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RatingBlog {
  @ApiProperty({ example: '' })
  @IsMongoId()
  @IsNotEmpty()
  blogId: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  star: number;
}
