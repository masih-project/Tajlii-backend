import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentByAdminDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
