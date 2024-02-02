import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class VerifyAuth {
  @ApiProperty({ example: '' })
  @IsOptional()
  @Matches(/^[a-zA-Z\-]+$/)
  @IsString()
  username: string;

  @ApiProperty({ example: '09364384344' })
  @IsOptional()
  @IsNumberString()
  @IsPhoneNumber('IR')
  mobile: string;

  @ApiProperty({ example: '1362482188' })
  @IsOptional()
  @Length(10)
  @IsNumberString()
  national_code: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  identification_code: string;

  @ApiProperty({ example: 'sasin' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code_upper_head: string;

  @ApiProperty({ example: 'test@gmail.com' })
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;
}
