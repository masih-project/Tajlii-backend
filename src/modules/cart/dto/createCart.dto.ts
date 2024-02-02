import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCart {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsMongoId()
  product_id: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  count: number
}
