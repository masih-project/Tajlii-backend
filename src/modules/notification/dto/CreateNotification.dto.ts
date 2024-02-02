import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateNotificatioDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: [] })
  @IsNotEmpty()
  @IsArray()
  receivers: string[];
}
