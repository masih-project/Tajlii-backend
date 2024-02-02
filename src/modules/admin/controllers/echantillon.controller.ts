import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateAshantionByAdminDto } from '@$/modules/ashantion/dto/createAshantionByAdmin.dto';
import { AshantionService } from '@$/modules/ashantion/ashantion.service';
import { AshantionResponse } from '@$/modules/ashantion/dto/ashantion.dto';
import { ApiPaginateResponse } from '@$/common/decorators/api-paginate-response.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UpdateAshantionByAdminDto } from '@$/modules/ashantion/dto/updateAshantionByAdmin.dto';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { QueryAshantionDto } from '@$/modules/ashantion/dto/query-ashantion.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/echantillon')
@Controller('admin/echantillon')
export class EchantillonController {
  constructor(private ashantionService: AshantionService) {}
  @Post('/')
  @HasPermissions('Create.Echantillon')
  async createAshantionByAdmin(@Body() body: CreateAshantionByAdminDto) {
    return this.ashantionService.createAshantionByAdmin(body);
  }

  @Patch('/:id')
  @HasPermissions('Update.Echantillon')
  async updateAshantionByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateAshantionByAdminDto) {
    return this.ashantionService.updateAshantionByAdmin(id, body);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Echantillon')
  async deleteAshantionByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.ashantionService.deleteAshantionByAdmin(id);
  }

  @Get('/:id')
  @HasPermissions('Read.Echantillon')
  @ApiOkResponse({ type: AshantionResponse })
  async getAshantionByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.ashantionService.getAshantionByAdmin(id);
  }

  @Get('/')
  @HasPermissions('Read.Echantillon')
  @ApiPaginateResponse(AshantionResponse)
  async getAshantionsByAdmin(@Query() query: QueryAshantionDto) {
    return this.ashantionService.getAshantionsByAdmin(query);
  }
}
