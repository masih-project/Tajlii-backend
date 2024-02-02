import { LayoutService } from '@$/modules/layout/services/layout.service';
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { AdminGuard } from '../guards/admin.guard';
import { AddLayoutDto, EditLayoutDto, LayoutResponse } from '@$/modules/layout/dtos/add-layout.dto';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/layout')
@Controller('admin/layout')
export class LayoutController {
  constructor(private readonly layoutService: LayoutService) {}

  @Get('/:id')
  @HasPermissions('Read.Layout')
  @ApiOkResponse({ type: LayoutResponse })
  async getLayout(@Param('id', ParseObjectIdPipe) id: string) {
    return this.layoutService.getLayout(id);
  }

  @Get('/')
  @HasPermissions('Read.Layout')
  @ApiOkResponse({ type: LayoutResponse })
  async getAll() {
    return this.layoutService.getAll();
  }

  @Patch('/:id')
  @HasPermissions('Update.Layout')
  @ApiOkResponse({ type: LayoutResponse })
  async editLayout(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: EditLayoutDto) {
    return this.layoutService.editLayout(id, dto);
  }

  @Post('/')
  @HasPermissions('Create.Layout')
  @ApiOkResponse({ type: LayoutResponse })
  async create(@Body() dto: AddLayoutDto) {
    return this.layoutService.addLayout(dto);
  }
}
