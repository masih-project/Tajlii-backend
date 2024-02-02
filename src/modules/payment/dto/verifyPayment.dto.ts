import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  authority: string;
}
