import { CouponService } from '@$/modules/copun/copun.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { CreateCopunDto } from '@$/modules/copun/dto/createCopun.dto';
import { Admin } from '../schemas/admin.schema';
import { GetAdmin } from '@$/common/decorators/get-admin.decorator';
import { QueryCopunDto } from '@$/modules/copun/dto/queryCopun.dto';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UpdateCopunDto } from '@$/modules/copun/dto/updateCopun.dto';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@Controller('admin/coupon')
@ApiTags('admin/coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('')
  @HasPermissions('Create.Coupon')
  async createCopun(@GetAdmin() admin: Admin, @Body() body: CreateCopunDto) {
    return this.couponService.createCopun(body, admin.username);
  }

  @Get('')
  @HasPermissions('Read.Coupon')
  async getCopuns(@Query() query: QueryCopunDto) {
    return this.couponService.getCopuns(query);
  }

  @Get('/:id')
  @HasPermissions('Read.Coupon')
  async getCopun(@Param('id', ParseObjectIdPipe) id: string) {
    return this.couponService.getCopun(id);
  }

  @Patch('/:id')
  @HasPermissions('Update.Coupon')
  async updateCopun(
    @GetAdmin() admin: Admin,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: UpdateCopunDto,
  ) {
    return this.couponService.updateCopun(id, body, admin.username);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Coupon')
  async deleteCopun(@GetAdmin() admin: Admin, @Param('id', ParseObjectIdPipe) id: string) {
    return this.couponService.deleteCopun(id, admin.username);
  }
}
