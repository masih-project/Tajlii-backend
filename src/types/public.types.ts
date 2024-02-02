import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export enum Gendar {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}
export class VerificationPhoneNumber {
  @ApiProperty({ example: '1234' })
  @IsNotEmpty()
  otp: string;
}

export class VerificationEmail {
  @ApiProperty({ example: '1234' })
  @IsNotEmpty()
  otp: string;
}
export class UpdateEmail {
  @IsObject()
  @ApiProperty({})
  @ValidateNested({ each: true })
  @Type(() => VerificationEmail)
  verification: VerificationEmail;
  @ApiProperty({ example: 'aminsehati70@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
export class UpdatePhoneNumber {
  @IsObject()
  @ApiProperty({})
  @ValidateNested({ each: true })
  @Type(() => VerificationPhoneNumber)
  verification: VerificationPhoneNumber;
  @ApiProperty({ example: '09364384344' })
  @IsNotEmpty()
  @IsPhoneNumber('IR')
  phone_number: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  confirm_password: string;
}

export enum OrderType {
  ASC = 'ASC',
  DESC = 'desc',
}

export enum DeliveryMethod {
  POST = 0,
  INPERSON = 1,
}
export enum PaymentWay {
  ZARINPAL = 0,
}
export enum RewardType {
  PERSONAL = 0,
  IDENTIFICATION = 1,
  MULTILEVEL = 2,
  GENERATION = 3,
}
