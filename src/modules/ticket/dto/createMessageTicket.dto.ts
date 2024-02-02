import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { statusReceiverDepartment } from 'src/types/status.types';

export class CreateMessageTicket {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ example: [], isArray: true, type: [String] })
  @IsNotEmpty()
  files: string[];
}
