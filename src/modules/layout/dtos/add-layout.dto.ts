import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { TopBannerDto } from './top-banner.dto';
import { NavbarDto } from './navbar.dto';
import { SliderDto } from './slider.dto';
import { MiddleBannerDto } from './middle-banner.dto';
import { CardDto } from './card.dto';
import { ButtonDto } from './button.dto';
import { FooterDto } from './footer.dto';
import { PartialType } from '@nestjs/swagger';

export class AddLayoutDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @Type(() => TopBannerDto)
  @ValidateNested()
  topBanner: TopBannerDto;

  @IsNotEmpty()
  @Type(() => NavbarDto)
  @ValidateNested()
  navbar: NavbarDto;

  @IsNotEmpty()
  @Type(() => SliderDto)
  @ValidateNested({ each: true })
  topSlider: SliderDto[];

  @IsNotEmpty()
  @Type(() => MiddleBannerDto)
  @ValidateNested()
  middleBanner: MiddleBannerDto;

  @IsNotEmpty()
  @Type(() => CardDto)
  @ValidateNested({ each: true })
  textCards: CardDto[];

  @IsNotEmpty()
  @Type(() => CardDto)
  @ValidateNested({ each: true })
  imageCards: CardDto[];

  @IsNotEmpty()
  @Type(() => ButtonDto)
  @ValidateNested()
  signupButton: ButtonDto;

  @IsNotEmpty()
  @Type(() => ButtonDto)
  @ValidateNested()
  incomePlanButton: ButtonDto;

  @IsNotEmpty()
  @Type(() => FooterDto)
  @ValidateNested()
  footer: FooterDto;
}

export class EditLayoutDto extends PartialType(AddLayoutDto) {}

export class LayoutResponse extends AddLayoutDto {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
