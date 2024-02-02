import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchDto } from '@$/common/dtos/search.dto';

class ContactusMetadataDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  age?: number;

  @IsOptional()
  @ApiProperty({ isArray: true })
  @IsArray()
  @IsString({ each: true })
  // @IsIn(ConcernTypeItems, { each: true })
  concern?: string[];
}
export class ContactUsDto {
  @IsNumberString()
  @IsPhoneNumber('IR')
  phone: string;

  //   @IsOptional()
  @IsString()
  fullname: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @Type(() => ContactusMetadataDto)
  @ValidateNested()
  metadata?: ContactusMetadataDto;
}

export class SearchContactusDto extends SearchDto {
  @IsOptional()
  @IsNumberString()
  phone?: string;

  // @IsOptional()
  // @IsIn(['phone', '_id', 'createdAt'])
  // sortBy?: 'phone' | '_id' | 'createdAt';
}
