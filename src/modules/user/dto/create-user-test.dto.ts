import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserTestDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({})
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  identification_code: string;

  @ApiProperty({ example: 'sasin' })
  @IsString()
  @IsOptional()
  code_upper_head: string;
  @ApiProperty({})
  @IsOptional()
  @IsNumber()
  personal_selling: number;

  @ApiProperty({})
  @IsOptional()
  @IsNumber()
  tottal_score_order: number;
}
