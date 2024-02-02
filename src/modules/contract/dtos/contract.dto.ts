import { IsIn, IsNotEmpty, IsNumberString, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ContractStatus, ContractStatusItems } from '../types';
import { SearchDto } from '@$/common/dtos/search.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ContractType, ContractTypeItems } from '../schemas/contract.schema';

export class CreateNaturalContractDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  identificationNumber: string;

  @IsString()
  @IsNumberString()
  @Length(10)
  nationalCode: string;

  @IsString()
  @IsNumberString()
  @IsPhoneNumber('IR')
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  phone: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  signingAgreement: string;
}

export class CreateLegalContractDto extends CreateNaturalContractDto {
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  economicalCode: string;
}

export class VerifyCodeAndCreateLegalDto extends CreateLegalContractDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
export class VerifyCodeAndCreateNaturalDto extends CreateNaturalContractDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class AssessContractDto {
  @IsIn(ContractStatusItems)
  status: ContractStatus;

  @IsString()
  @IsOptional()
  assessDescription?: string;
}

export class SearchContractDto extends SearchDto {
  @ApiProperty({ enum: ContractTypeItems })
  @IsIn(ContractTypeItems)
  @IsOptional()
  type?: ContractType;

  @ApiProperty({ enum: ContractStatusItems })
  @IsIn(ContractStatusItems)
  @IsOptional()
  status?: ContractStatus;

  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsNumberString()
  mobile?: string;

  @IsOptional()
  @IsNumberString()
  nationalCode?: string;
}
