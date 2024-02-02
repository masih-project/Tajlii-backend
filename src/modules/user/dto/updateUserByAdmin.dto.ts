import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Gendar } from 'src/types/public.types';
import { RoleUser } from 'src/types/role.types';
import { Document, BankInfo } from '../dto/updateUser.dto';
export class UpdateUserByAdmin {
  @ApiProperty({ example: 'Amin' })
  @IsOptional()
  @IsString()
  first_name: string;
  @ApiProperty({ example: 'Sehati' })
  @IsOptional()
  @IsString()
  last_name: string;
  @ApiProperty({ example: 'MALE' })
  @IsOptional()
  @IsEnum(Gendar, { each: true })
  gender: string;
  @ApiProperty({ example: '1362482188' })
  @Length(10)
  @IsNumberString()
  @IsOptional()
  national_code: string;
  @ApiProperty({ example: 'سعادت آباد' })
  @IsOptional()
  @IsString()
  address: string;
  @ApiProperty({ example: '22119783' })
  @IsOptional()
  @IsNumberString()
  @Length(8)
  phone_number: string;
  @ApiProperty({ example: '09364384344' })
  @IsOptional()
  @IsPhoneNumber('IR')
  @IsNumberString()
  mobile: string;
  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  identification_code: string;
  @ApiProperty({ example: 'AminSehati' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z\-]+$/)
  username: string;
  @ApiProperty({ example: '1352348792' })
  @IsNumberString()
  @Length(10)
  @IsOptional()
  postal_code: string;
  @ApiProperty({ example: '12345678' })
  @IsOptional()
  @MinLength(8)
  password: string;
  @ApiProperty({ example: '12345678' })
  @IsOptional()
  @MinLength(8)
  confirm_password: string;
  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  is_iranian: boolean;
  @ApiProperty({ example: '2022-11-06' })
  @IsOptional()
  @IsISO8601()
  brith_day: string;
  @ApiProperty({ example: '631748ef0abaa6205f313cac' })
  @IsOptional()
  city_id: string;

  @ApiProperty({ example: 'sasin' })
  @IsOptional()
  @IsString()
  code_upper_head: string;
  @ApiProperty({ example: '' })
  @IsOptional()
  father_name: string;
  @ApiProperty({ example: '1362482188' })
  @IsNumberString()
  @IsOptional()
  birth_certificate_code: string;
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  status: 0 | 1 | 2;
  @ApiProperty({ example: ['CUSTOMER'] })
  @IsOptional()
  @IsEnum(RoleUser, { each: true })
  role: RoleUser[];

  @ApiProperty({ example: 'AminSehati70@gmail.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ type: Document })
  @Type(() => Document)
  @ValidateNested({ each: true })
  doumnets: Document;

  @ApiProperty({ type: BankInfo })
  @Type(() => BankInfo)
  @ValidateNested({ each: true })
  bank_info: BankInfo;
}
