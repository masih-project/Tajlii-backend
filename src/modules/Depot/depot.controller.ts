import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DepotService } from './depot.service';

@Controller('/depot')
@ApiTags('Depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @Get('/')
  async getDepots() {
    return await this.depotService.getDepots();
  }
}
