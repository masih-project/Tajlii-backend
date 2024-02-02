import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class DeleteCartDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsMongoId()
  product_id: string;
}
