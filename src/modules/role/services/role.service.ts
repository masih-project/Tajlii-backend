import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from '../schemas/role.schema';
import { Model } from 'mongoose';
import { AddRoleDto, EditRoleDto } from '../dtos/role.dto';
import { PermissionTypeGroups, PermissionTypeItems } from '../types';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) {}

  async addRole(dto: AddRoleDto) {
    return this.roleModel.create(dto);
  }

  async editRole(_id: string, dto: EditRoleDto) {
    const result = await this.roleModel.updateOne({ _id }, dto).exec();
    if (!result.modifiedCount) throw new NotFoundException();
    return this.roleModel.findOne({ _id });
  }

  async getRole(_id: string) {
    const role = await this.roleModel.findOne({ _id }).exec();
    if (!role) throw new NotFoundException('role not found');
    return role;
  }

  async getAllRoles() {
    const items = await this.roleModel.find().exec();
    const count = await this.roleModel.find().count();
    return {
      items,
      count,
    };
  }

  async getPermissions(grouped?: boolean) {
    if (grouped) return PermissionTypeGroups;
    return PermissionTypeItems;
  }
}
