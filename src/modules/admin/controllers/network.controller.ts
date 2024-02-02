import { Body, Controller, Delete, Get, Param, Post, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginateResponse } from 'src/common/decorators/api-paginate-response.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { NetworkService } from '@$/modules/network/network.service';
import { NetworkResponse } from '@$/modules/network/dto/network.dto';
import { QueryNetwork } from '@$/modules/network/dto/queryNetwork.dto';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UpdateNetworkUserByAdmin } from '@$/modules/network/dto/updateNetworkUserByAdmin.dto';
import { QueryPeriodDto } from '@$/modules/network/dto/queryPeriod.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@Controller('admin/network')
@ApiTags('admin/network')
export class NetworkController {
  constructor(private networkService: NetworkService) {}

  @Get('/')
  @HasPermissions('Read.Network')
  @ApiPaginateResponse(NetworkResponse)
  async getNetworksByAdmin(@Query() query: QueryNetwork) {
    return this.networkService.getNetworksByAdmin(query);
  }

  @Get('/:id')
  @HasPermissions('Read.Network')
  @ApiOkResponse({ type: NetworkResponse })
  async getNetworkByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.networkService.getNetworkByAdmin(id);
  }

  @Patch('/:id')
  @HasPermissions('Update.Network')
  async updateNetworkByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateNetworkUserByAdmin) {
    return this.networkService.updateNetworkByAdmin(id, body);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Network')
  async deleteNetworkByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.networkService.deleteNetworkByAdmin(id);
  }

  @Post('/personal-selling')
  @HasPermissions('Update.Network')
  async personalSellingByAdmin(@Body() body: QueryPeriodDto) {
    return this.networkService.personalSellingByAdmin(body);
  }

  @Post('/team-selling')
  @HasPermissions('Update.Network')
  async teamlSellingByAdmin(@Body() body: QueryPeriodDto) {
    return this.networkService.teamSellingByAdmin(body);
  }

  @Post('/score-order')
  @HasPermissions('Update.Network')
  async scoreOrder(@Body() body: QueryPeriodDto) {
    return this.networkService.scoreOrderByAdmin(body);
  }

  @Post('/team-score-order')
  @HasPermissions('Update.Network')
  async totalTeamScoreOrderByAdmin(@Body() body: QueryPeriodDto) {
    return this.networkService.totalTeamScoreOrderByAdmin(body);
  }

  @Post('/rank')
  @HasPermissions('Read.Network')
  async calculateRankByAdmin(@Body() body: QueryPeriodDto) {
    return this.networkService.calculateRankByAdmin(body);
  }

  @Post('/network')
  async calculateNetwork(@Body() body: QueryPeriodDto) {
    return this.networkService.calculateNetworkByAdmin(body);
  }
}
