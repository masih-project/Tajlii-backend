import { IsNumber, IsNumberString, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MultiLevelRewardPercentage {
  @ApiProperty()
  @IsNumber()
  level1: number;

  @ApiProperty()
  @IsNumber()
  level2: number;

  @ApiProperty()
  @IsNumber()
  level3: number;

  @ApiProperty()
  @IsNumber()
  level4: number;

  @ApiProperty()
  @IsNumber()
  level5: number;
}

export class GenerationRewardPercentage {
  @ApiProperty()
  @IsNumber()
  level1: number;

  @ApiProperty()
  @IsNumber()
  level2: number;

  @ApiProperty()
  @IsNumber()
  level3: number;

  @ApiProperty()
  @IsNumber()
  level4: number;
}

export class CreateSettingDto {
  @IsOptional()
  @IsNumber()
  price_post: number;

  @IsOptional()
  @IsNumber()
  tax_percent: number;

  @IsOptional()
  @IsNumber()
  dollar_price: number;

  @IsOptional()
  @IsNumber()
  postal_code: number;

  @IsOptional()
  @IsNumber()
  priceFreeShipHub: number;

  @IsOptional()
  @IsNumber()
  discountPlan: number;

  @IsOptional()
  @IsNumberString()
  phone_number: string;

  @IsOptional()
  identificationRewardPercentage: number;

  @ApiProperty({ type: [MultiLevelRewardPercentage] })
  @Type(() => MultiLevelRewardPercentage)
  @ValidateNested({ each: true })
  multiLevelRewardPercentage: MultiLevelRewardPercentage;

  @ApiProperty({ type: [GenerationRewardPercentage] })
  @Type(() => GenerationRewardPercentage)
  @ValidateNested({ each: true })
  generationRewardPercentage: GenerationRewardPercentage;
}

export class UpdateSettingDto extends PartialType(CreateSettingDto) {}
