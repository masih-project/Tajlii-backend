import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class QueryExportExcelRewardByAdmin {
  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  type: number;

  @ApiProperty({})
  @IsNotEmpty()
  period: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  user: string;
}

export class QueryExportExcelReward {
  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  type: number;

  @ApiProperty({ required: false })
  @IsOptional()
  period: string;
}
