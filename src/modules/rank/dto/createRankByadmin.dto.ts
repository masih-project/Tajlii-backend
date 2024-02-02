import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRankByAdminDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  team_goal: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  min_personal_selling: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  max_personal_selling: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  team_selling: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  count_axis: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  number_rank: number;
}
