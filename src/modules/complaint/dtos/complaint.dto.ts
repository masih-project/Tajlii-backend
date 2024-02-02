import { IsIn, IsNotEmpty, IsNumberString, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ComplaintType } from '../types';
import { OmitType } from '@nestjs/swagger';

export class AddComplaintDto {
  @IsIn(Object.keys(ComplaintType))
  type: keyof typeof ComplaintType;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('IR')
  phone: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(5)
  code: string;
}

export class ComplaintResponse extends OmitType(AddComplaintDto, ['code']) {
  _id: string;
  isAnswered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetSmsCodeDto {
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('IR')
  phone: string;
}
