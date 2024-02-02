import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsPhoneNumber, IsString } from 'class-validator';

export class CreateAddress {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  city_id: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsPhoneNumber('IR')
  @IsNumberString()
  mobile: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsNumberString()
  postal_code: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  address: string;
}
