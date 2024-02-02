import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsMongoId, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  manager: string;

  @IsOptional()
  @IsArray()
  @Type(() => CampaignBeneficiaryDto)
  @ValidateNested({ each: true })
  beneficiaries?: CampaignBeneficiaryDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsDate()
  startDate?: Date;
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsMongoId()
  admin?: string;
}

export class EditCampaignDto extends PartialType(CreateCampaignDto) {}

export class CampaignBeneficiaryDto {
  @IsMongoId()
  marketer: string;

  @IsInt()
  order: number;

  @IsInt()
  @Min(0)
  saleCeiling: number;
}
