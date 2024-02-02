import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { statusInventory } from 'src/types/status.types';

export class UpdateDepotDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsNumberString()
  @IsPhoneNumber('IR')
  phone: string;

  @IsOptional()
  @IsEnum(statusInventory, { each: true })
  status: statusInventory.CANCELED | statusInventory.CONFIRMED;
}
