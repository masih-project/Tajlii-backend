import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class LoginUser {
  @ApiProperty({ example: 'aminsehati' })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\-]+$/)
  username: string;
  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  password: string;
}
