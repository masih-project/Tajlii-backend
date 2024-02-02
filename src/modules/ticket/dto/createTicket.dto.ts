import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, isMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { statusReceiverDepartment } from 'src/types/status.types';

export class CreateTicket {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsMongoId()
  department: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  importance: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ example: [], isArray: true, type: [String] })
  @IsNotEmpty()
  files: string[];
}
