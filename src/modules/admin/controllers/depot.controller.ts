import { Body, Controller, Delete, Get, Param, Post, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { GetAdmin } from '@$/common/decorators/get-admin.decorator';
import { Admin } from '../schemas/admin.schema';
import { DepotService } from '@$/modules/Depot/depot.service';
import { CreateDepotDto } from '@$/modules/Depot/dto/createDepot.dto';
import { UpdateDepotDto } from '@$/modules/Depot/dto/updateDepot.dto';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { DepotResponse } from '@$/modules/Depot/dto/depot.dto';
import { ApiPaginateResponse } from '@$/common/decorators/api-paginate-response.decorator';
import { QueryDepot } from '@$/modules/Depot/dto/queryDepot.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@Controller('admin/depot')
@ApiTags('admin/depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @Post('/')
  @HasPermissions('Create.Depot')
  async createDepotByAdmin(@GetAdmin() admin: Admin, @Body() body: CreateDepotDto) {
    return this.depotService.createDepotByAdmin(body, admin.username);
  }

  @Patch('/:id')
  @HasPermissions('Update.Depot')
  async updateDepotByAdmin(
    @GetAdmin() admin: Admin,
    @Body() body: UpdateDepotDto,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.depotService.updateDepotByAdmin(id, body, admin.username);
  }

  @HasPermissions('Delete.Depot')
  @Delete('/:id')
  async deleteDepotByAdmin(@GetAdmin() admin: Admin, @Param('id', ParseObjectIdPipe) id: string) {
    return this.depotService.deleteDepotByAdmin(id, admin.username);
  }

  @Get('/')
  @HasPermissions('Read.Depot')
  @ApiPaginateResponse(DepotResponse)
  async getDepotsByAdmin(@Query() input: QueryDepot) {
    return this.depotService.getDepotsByAdmin(input);
  }

  @Get('/:id')
  @HasPermissions('Read.Depot')
  @ApiOkResponse({ type: DepotResponse })
  async getDepotByAdmin(@Param('id') id: string) {
    return this.depotService.getDepotByAdmin(id);
  }
}
