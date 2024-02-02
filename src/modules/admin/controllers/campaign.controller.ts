import { Controller, Body, Post, Patch, Param, Get, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { AdminGuard } from '../guards/admin.guard';
import { CampaignService } from '@$/modules/campaign/services/campaign.service';
import { CreateCampaignDto, EditCampaignDto } from '@$/modules/campaign/dtos/campaign.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/campaign')
@Controller('admin/campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  // @HasPermissions('Create.Brand')
  @Post('/')
  async createCampaign(@Body() dto: CreateCampaignDto) {
    return this.campaignService.createCampaign(dto);
  }

  @Patch('/:id')
  async editCampaign(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: EditCampaignDto) {
    return this.campaignService.editCampaign(id, dto);
  }

  @Delete('/:id')
  async deleteCampaign(@Param('id', ParseObjectIdPipe) id: string) {
    return this.campaignService.deleteCampaign(id);
  }

  @Get('/:id')
  async getCampaign(@Param('id', ParseObjectIdPipe) id: string) {
    return this.campaignService.getCampaignInfo(id, true);
  }

  @Get('/')
  async searchCampaigns() {
    return this.campaignService.searchCampaigns();
  }
}
