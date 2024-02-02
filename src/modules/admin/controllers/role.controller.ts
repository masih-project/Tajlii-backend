import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { RoleService } from '@$/modules/role/services/role.service';
import { AddRoleDto, EditRoleDto, RoleResponse } from '@$/modules/role/dtos/role.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/role')
@Controller('admin/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/permissions')
  @ApiOkResponse({})
  async getPermissions() {
    return this.roleService.getPermissions(true);
  }

  @Get('/:id')
  @ApiOkResponse({ type: RoleResponse })
  async getRole(@Param('id', ParseObjectIdPipe) id: string) {
    return this.roleService.getRole(id);
  }

  @Get('/')
  @ApiOkResponse({ type: RoleResponse, isArray: true })
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Patch('/:id')
  @HasPermissions('Update.Role')
  @ApiOkResponse({ type: RoleResponse })
  async editRole(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: EditRoleDto) {
    return this.roleService.editRole(id, dto);
  }

  @Post('/')
  // @HasPermissions('Create.Role')
  @ApiOkResponse({ type: RoleResponse })
  async addRole(@Body() dto: AddRoleDto) {
    return this.roleService.addRole(dto);
  }
}
