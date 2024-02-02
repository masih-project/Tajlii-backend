import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsPhoneNumber, IsString, Matches } from 'class-validator';

export class UpdateAdminMeDto {
  @ApiProperty({ example: 'Amin' })
  @IsOptional()
  @IsString()
  first_name: string;
  @ApiProperty({ example: 'Sehati' })
  @IsOptional()
  @IsString()
  last_name: string;
  @ApiProperty({ example: 'aminsehati' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z\-]+$/)
  username: string;
  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumberString()
  status: string;
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  img_url: string;

  @ApiProperty({ example: '09364384344' })
  @IsPhoneNumber('IR')
  @IsOptional()
  phone_number: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  password: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  confirm_password: string;
}
