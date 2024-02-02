import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class PersonalRewardDto {
  @ApiProperty({ example: '' })
  @IsMongoId()
  @IsNotEmpty()
  period: string;
}
