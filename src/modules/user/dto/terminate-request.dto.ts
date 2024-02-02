import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';
import { TerminateRequestReason } from '../schema/terminate-request.schema';

export class CreateTerminateRequestDto {
  @ApiProperty({ enum: TerminateRequestReason })
  @IsIn(TerminateRequestReason)
  @IsString()
  reason: (typeof TerminateRequestReason)[number];

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  password: string;
}
export class VerifyTerminateRequestDto {
  @ApiProperty()
  @IsMongoId()
  requestId: string;

  @ApiProperty()
  @IsString()
  code: string;
}
