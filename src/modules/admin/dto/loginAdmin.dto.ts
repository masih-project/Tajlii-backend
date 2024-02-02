import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginAdmin {
  @ApiProperty({ example: 'AminSehati' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\-]+$/)
  username: string;
  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
