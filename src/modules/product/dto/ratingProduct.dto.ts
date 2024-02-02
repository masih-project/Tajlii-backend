import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RatingProduct {
  @ApiProperty({ example: '' })
  @IsMongoId()
  @IsNotEmpty()
  product_id: string;
  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  star: number;
}
