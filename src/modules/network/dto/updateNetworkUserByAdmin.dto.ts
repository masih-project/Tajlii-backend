import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateNetworkUserByAdmin {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  personal_selling: number;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  team_selling: number;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  rank: string;
}
