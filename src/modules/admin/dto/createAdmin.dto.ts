import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: '09364384344' })
  @IsNotEmpty()
  @IsNumberString()
  @IsPhoneNumber('IR')
  phone_number: string;
  @ApiProperty({ example: 'aminsehati70@Gmail.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @ApiProperty({ example: 'Amin' })
  @IsNotEmpty()
  @IsString()
  first_name: string;
  @ApiProperty({ example: 'Sehati' })
  @IsNotEmpty()
  @IsString()
  last_name: string;
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
  @ApiProperty({ example: 'AminSehati' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\-]+$/)
  username: string;

  @ApiProperty({})
  @IsNotEmpty()
  @IsOptional()
  roleId: string;

  @ApiProperty({ example: [] })
  @IsArray()
  @IsString({ each: true })
  departments: string[];
}

export class SignupAdminDto {
  @IsNumberString()
  @IsPhoneNumber('IR')
  phone_number: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsAlphanumeric()
  username: string;

  @IsOptional()
  @IsMongoId()
  roleId: string;
}

export class LoginAdminDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
