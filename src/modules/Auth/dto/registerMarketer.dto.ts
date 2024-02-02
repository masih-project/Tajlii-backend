import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsISO8601, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from 'class-validator';
import { RegisterCustomerDto } from './registerCustomer.dto';

export class RegisterMarketerDto extends PartialType(RegisterCustomerDto) {
  @ApiProperty({ example: 'sasin' })
  @IsString()
  @IsNotEmpty()
  code_upper_head: string;
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  father_name: string;
  @ApiProperty({ example: '1362482188' })
  @IsNumberString()
  @IsNotEmpty()
  birth_certificate_code: string;
  @ApiProperty({ example: '22119783' })
  @IsOptional()
  @IsNumberString()
  @Length(8)
  phone_number: string;
  @ApiProperty({ example: 'aminsehati70@gmail.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @ApiProperty({ example: '1352348792' })
  @IsNumberString()
  @Length(10)
  @IsOptional()
  postal_code: string;
  @ApiProperty({ example: 'سعادت آباد' })
  @IsOptional()
  @IsString()
  address: string;
  @ApiProperty({ example: '2022-11-06' })
  @IsNotEmpty()
  @IsISO8601()
  brith_day: string;
}
