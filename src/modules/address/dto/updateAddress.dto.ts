import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
export class UpdateAddress {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  first_name: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  city_id: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  last_name: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsPhoneNumber('IR')
  @IsNumberString()
  mobile: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsNumberString()
  postal_code: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  address: string;
}
