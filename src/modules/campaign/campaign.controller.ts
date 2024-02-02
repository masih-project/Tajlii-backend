import { Controller, Param, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CampaignService } from './services/campaign.service';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';

@ApiTags('campaign')
@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get('/:id/beneficiary')
  async getBeneficiary(@Param('id', ParseObjectIdPipe) id: string) {
    return this.campaignService.getBeneficiary(id);
  }
}
