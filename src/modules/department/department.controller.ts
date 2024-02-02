import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DepartmentService } from './department.service';

@ApiTags('Department')
@Controller('/department')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Get('/')
  async getDepartments() {
    return this.departmentService.getDepartments();
  }
}
