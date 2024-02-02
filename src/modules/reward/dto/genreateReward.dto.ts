import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GenreateRewardDto {
  @ApiProperty({ example: '' })
  @IsMongoId()
  @IsNotEmpty()
  period: string;
}
