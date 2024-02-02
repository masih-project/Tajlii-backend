import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentWay } from 'src/types/public.types';

export class PaymentGatewayDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @ApiProperty({ example: 0, required: true })
  @IsNotEmpty()
  @IsEnum(PaymentWay, { each: true })
  payment_way: PaymentWay;
}

export class InitSamanPaymentDto {
  @IsString()
  @IsMongoId()
  orderId: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  campaignId?: string;
}
