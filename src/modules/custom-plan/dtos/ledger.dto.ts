import { IsInt, IsOptional, IsString } from 'class-validator';
import { MySearchDto } from './search.dto';

export class SearchLedgerDto extends MySearchDto {
  @IsOptional()
  @IsInt()
  periodId?: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  nationalCode?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
