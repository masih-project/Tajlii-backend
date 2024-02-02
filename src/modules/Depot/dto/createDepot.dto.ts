import { IsNotEmpty, IsNumberString, IsPhoneNumber, IsString } from 'class-validator';

export class CreateDepotDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumberString()
  @IsPhoneNumber('IR')
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}
