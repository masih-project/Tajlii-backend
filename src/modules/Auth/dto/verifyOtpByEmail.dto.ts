import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumberString, IsObject, IsString, ValidateNested } from 'class-validator';
import { VerificationEmail } from 'src/types/public.types';

export class VerifyOtpByEmail {
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
