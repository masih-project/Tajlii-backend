import { IsArray, IsIn, IsString } from 'class-validator';
import { PermissionType, PermissionTypeItems } from '../types';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class AddRoleDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @IsIn(PermissionTypeItems, { each: true })
  permissions: PermissionType[];
}

export class EditRoleDto extends PartialType(AddRoleDto) {}

export class RoleResponse extends AddRoleDto {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
