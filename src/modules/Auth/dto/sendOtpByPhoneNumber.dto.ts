import { IsNotEmpty, IsNumberString, IsPhoneNumber, IsString } from 'class-validator';

export class SendOtpDto {
  @IsPhoneNumber('IR')
  @IsNotEmpty()
  @IsNumberString()
  mobile: string;
}

export class VerifyOtpDto extends SendOtpDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
