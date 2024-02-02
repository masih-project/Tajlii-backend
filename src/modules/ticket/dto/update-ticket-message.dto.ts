import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMessageTicketByAdmin {
  @ApiProperty({ example: '' })
  @IsOptional()
  message: string;

  @ApiProperty({ example: [], isArray: true, type: [String] })
  @IsNotEmpty()
  files: string[];
}
