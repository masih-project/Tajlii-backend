import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { Gendar } from 'src/types/public.types';

export class RegisterCustomerDto {
  @ApiProperty({ example: 'Amin' })
  @IsNotEmpty()
  @IsString()
  first_name: string;
  @ApiProperty({ example: 'Sehati' })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MALE' })
  @IsNotEmpty()
  @IsEnum(Gendar, { each: true })
  gender: string;
  @ApiProperty({ example: '1362482188' })
  @Length(10)
  @IsNumberString()
  @IsOptional()
  national_code: string;
  @ApiProperty({ example: '09364384344' })
  @IsNotEmpty()
  @IsNumberString()
  @IsPhoneNumber('IR')
  mobile: string;
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  identification_code: string;
  @ApiProperty({ example: 'AminSehati' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\-]+$/)
  username: string;
  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @MinLength(8)
  confirm_password: string;
  @ApiProperty({ example: false })
  @IsNotEmpty()
  @IsBoolean()
  is_iranian: boolean;
  @ApiProperty({ example: '631748ef0abaa6205f313cac' })
  @IsNotEmpty()
  city_id: string;
}

export class RegisterCustomerSendOtpDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsNumberString()
  @IsPhoneNumber('IR')
  mobile: string;

  @IsString()
  @IsNotEmpty()
  identification_code: string;
}

export class RegisterCustomerVerifyDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsNumberString()
  @IsPhoneNumber('IR')
  mobile: string;

  @IsString()
  @IsNotEmpty()
  identification_code: string;
}
export class RegisterCustomerResendCodeDto {
  @IsNotEmpty()
  @IsNumberString()
  @IsPhoneNumber('IR')
  mobile: string;
}
