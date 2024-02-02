import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasPermissions } from 'src/common/decorators/has-permissions.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { CreateBrandDto } from 'src/modules/brand/dto/createBrand.dto';
import { BrandService } from 'src/modules/brand/brand.service';
import { Admin } from '../schemas/admin.schema';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { UpdateBrandDto } from 'src/modules/brand/dto/updateBrand.dto';
import { GetAdmin } from '@$/common/decorators/get-admin.decorator';
import { AuditLog } from '@$/common/decorators/audit-log.decorator';
import { Brand } from '@$/modules/brand/brand.schema';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/brand')
@Controller('admin/brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post('/')
  @HasPermissions('Create.Brand')
  @AuditLog(Brand.name, 'CREATE')
  async createBrand(@GetAdmin() admin: Admin, @Body() body: CreateBrandDto) {
    return this.brandService.createBrandByAdmin(body, admin.username);
  }

  @Patch('/:id')
  @HasPermissions('Update.Brand')
  async updateBrandByAdmin(
    @GetAdmin() admin: Admin,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: UpdateBrandDto,
  ) {
    return this.brandService.updateBrandByAdmin(id, body, admin.username);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Brand')
  async deleteBrandByAdmin(@GetAdmin() admin: Admin, @Param('id', ParseObjectIdPipe) id: string) {
    return this.brandService.deleteBrandByAdmin(id, admin.username);
  }
}
