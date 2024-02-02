import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendOtpByEmail {
  @ApiProperty({ example: 'AminSehati70@Gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
