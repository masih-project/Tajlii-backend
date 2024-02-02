import { statusTicket } from '@$/types/status.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId, IsEnum, IsOptional } from 'class-validator';

export class UpdateTicketByAdminDto {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  subject: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  importance: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  message: string;

  @IsEnum(statusTicket)
  @ApiProperty({
    enum: statusTicket,
  })
  @IsOptional()
  status: statusTicket;
}
