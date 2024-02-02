import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { DeliveryMethod } from 'src/types/public.types';

export class UpdateOrder {
  @ApiProperty({ example: '' })
  @IsMongoId()
  @IsOptional()
  address: string;

  @ApiProperty({ example: 0, required: true })
  @IsOptional()
  @IsEnum(DeliveryMethod, { each: true })
  @IsNumber()
  delivery_method: DeliveryMethod;

  @ApiProperty({})
  @IsString()
  @IsOptional()
  depot: string;
}
