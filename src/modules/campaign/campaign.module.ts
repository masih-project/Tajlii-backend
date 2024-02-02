import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './services/campaign.service';
import { UserModule } from '../user/user.module';
import { NetworkModule } from '../network/network.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Campaign.name, schema: CampaignSchema }]), UserModule, NetworkModule],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
