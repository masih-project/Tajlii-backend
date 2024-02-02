import { UpdateDepartmentByAdminDto } from './../../department/dto/updateDepartment.dto';
import { CreateDepartmentByAdminDto } from './../../department/dto/createDepartment.dto';
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { DepartmentService } from '@$/modules/department/department.service';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/Department')
@Controller('admin/department')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @HasPermissions('Create.Department')
  @Post('/')
  async createCategoryTicketByAdmin(@Body() body: CreateDepartmentByAdminDto) {
    return this.departmentService.createDepartmentByAdmin(body);
  }

  @HasPermissions('Update.Department')
  @Patch('/:id')
  async updateCategoryTicketByAdmin(
    @Body() body: UpdateDepartmentByAdminDto,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.departmentService.updateDepartmentByAdmin(id, body);
  }

  @HasPermissions('Read.Department')
  @Get('/')
  async getDepartments() {
    return this.departmentService.getDepartments();
  }

  @HasPermissions('Read.Department')
  @Get('/:id')
  async getDepartment(@Param('id', ParseObjectIdPipe) id: string) {
    return this.departmentService.getDepartment(id);
  }
}
