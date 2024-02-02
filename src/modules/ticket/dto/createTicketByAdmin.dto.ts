import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createTicketByAdmin {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  file: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsMongoId()
  receiver_user: string;

  @ApiProperty({ example: [], isArray: true, type: [String] })
  @IsNotEmpty()
  files: string[];

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  importance: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsMongoId()
  department: string;
}
