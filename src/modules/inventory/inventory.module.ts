import { Module } from '@nestjs/common';
import { InventorySchema } from './inventory.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { PublicUtils } from '@$/utils/public-utils';
import { InventoryHistoriesSchema } from '../inventoryHistories/inventoryHistories.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'inventories', schema: InventorySchema },
      { name: 'inventoryHistories', schema: InventoryHistoriesSchema },
    ]),
  ],
  controllers: [],
  providers: [InventoryService, PublicUtils],
  exports: [InventoryService],
})
export class InventoryModule {}
