import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDepartmentByAdminDto {
  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  name: string;
}
