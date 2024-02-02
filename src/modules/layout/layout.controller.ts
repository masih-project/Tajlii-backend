import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LayoutService } from './services/layout.service';
import { LayoutResponse } from './dtos/add-layout.dto';

@ApiTags('layout')
@Controller('layout')
export class LayoutController {
  constructor(private readonly layoutService: LayoutService) {}

  @Get('/active')
  @ApiOkResponse({ type: LayoutResponse })
  async getActiveLayout() {
    return this.layoutService.getActiveLayout();
  }
}
