import { SearchDto } from '@$/common/dtos/search.dto';
import { TerminateRequestReason, TerminateRequestStatus } from '@$/modules/user/schema/terminate-request.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class SearchTerminateRequestDto extends SearchDto {
  @ApiProperty({ enum: TerminateRequestStatus })
  @IsIn(TerminateRequestStatus)
  @IsOptional()
  @IsString()
  status?: (typeof TerminateRequestStatus)[number];

  @ApiProperty({ enum: TerminateRequestReason })
  @IsIn(TerminateRequestReason)
  @IsOptional()
  @IsString()
  reason?: (typeof TerminateRequestReason)[number];
}

export class AssessTerminateRequestDto {
  @ApiProperty()
  @IsBoolean()
  terminate: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
}
