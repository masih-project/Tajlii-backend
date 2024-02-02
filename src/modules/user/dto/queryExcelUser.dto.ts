import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { RoleUser } from 'src/types/role.types';

export class QueryExcelUser {
  @ApiProperty({
    example: 'CUSTOMER',
    required: false,
    enumName: 'Role',
    enum: RoleUser,
  })
  @IsOptional()
  @IsEnum(RoleUser, { each: true })
  role: RoleUser;
}
