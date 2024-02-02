import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsNotEmpty, IsNumberString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Gendar } from 'src/types/public.types';
export class Document {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  img_national_code: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  img_birth_certificate_code: string;
}
export class BankInfo {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  bank_name: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsNumberString()
  card_number: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsNumberString()
  account_number: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsNumberString()
  shaba_number: string;
}
export class UpdateUser {
  @ApiProperty({ example: 'Amin' })
  @IsOptional()
  @IsString()
  first_name: string;
  @ApiProperty({ example: 'Amin' })
  @IsOptional()
  @IsString()
  last_name: string;
  @ApiProperty({ example: 'MALE' })
  @IsOptional()
  @IsEnum(Gendar, { each: true })
  gender: string;
  @ApiProperty({ example: 'سعادت آباد' })
  @IsString()
  @IsOptional()
  address: string;
  @ApiProperty({ example: '2022-11-06' })
  @IsOptional()
  @IsISO8601()
  brith_day: string;
  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  father_name: string;
  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  img_url: string;

  @ApiProperty({ type: Document })
  @Type(() => Document)
  @ValidateNested({ each: true })
  documents: Document;

  @ApiProperty({ type: BankInfo })
  @Type(() => BankInfo)
  @ValidateNested({ each: true })
  bank_info: BankInfo;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  city_id: string;

}
