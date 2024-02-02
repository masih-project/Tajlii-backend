import { Body, Controller, Delete, Get, Param, Post, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginateResponse } from 'src/common/decorators/api-paginate-response.decorator';
import { PeriodService } from '@$/modules/period/period.service';
import { PeriodResponse, QueryPeriodDto } from '@$/modules/period/dto/queryPeriod.dto';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UpdatePeriodDto } from '@$/modules/period/dto/updatePeriod.dto';
import { CreatePeriodDto } from '@$/modules/period/dto/createPeriod.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/period')
@Controller('admin/period')
export class PeriodController {
  constructor(private periodService: PeriodService) {}

  @Get('/')
  @HasPermissions('Read.Period')
  @ApiPaginateResponse(PeriodResponse)
  async getPeriods(@Query() query: QueryPeriodDto) {
    return this.periodService.getPeriodsByAdmin(query);
  }

  @Get('/:id')
  @HasPermissions('Read.Period')
  @ApiOkResponse({ type: PeriodResponse })
  async getPeriod(@Param('id', ParseObjectIdPipe) id: string) {
    return this.periodService.getPeriod(id);
  }

  @Patch('/:id')
  @HasPermissions('Update.Period')
  async updatePeriodByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdatePeriodDto) {
    return this.periodService.updatePeriodByAdmin(id, body);
  }

  @Post('/')
  @HasPermissions('Create.Period')
  async createPeriodByAdmin(@Body() body: CreatePeriodDto) {
    return this.periodService.createPeriodByAdmin(body);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Period')
  async deletePeriodByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.periodService.deletePeriodByAdmin(id);
  }
}
