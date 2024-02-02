import { Module } from '@nestjs/common';
import { JWTUtils } from 'src/utils/jwt-utils';
import { PublicUtils } from 'src/utils/public-utils';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DepotSchema } from './depot.schema';
import { DepotLogger } from 'src/logger/depot/depotLogger';
import { adminSchema } from '../admin/schemas/admin.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'depots', schema: DepotSchema },
      { name: 'admins', schema: adminSchema },
    ]),
  ],
  controllers: [DepotController],
  providers: [DepotService, JWTUtils, PublicUtils, DepotLogger],
  exports: [DepotService],
})
export class DepotModule {}
