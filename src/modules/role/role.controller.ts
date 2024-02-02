import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleService } from './services/role.service';

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
}
