import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRankByAdminDto {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  team_goal: string;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  min_personal_selling: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  max_personal_selling: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  team_selling: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  count_axis: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  number_rank: number;
}
