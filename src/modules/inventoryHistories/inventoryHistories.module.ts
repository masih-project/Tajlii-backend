import { Module } from '@nestjs/common';
import { InventoryHistoriesSchema } from './inventoryHistories.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryHistoriesService } from './inventoryHistories.service';
import { PublicUtils } from '@$/utils/public-utils';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'inventoryHistories', schema: InventoryHistoriesSchema }])],
  controllers: [],
  providers: [InventoryHistoriesService, PublicUtils],
  exports: [InventoryHistoriesService],
})
export class InventoyHistoriesModule {}
