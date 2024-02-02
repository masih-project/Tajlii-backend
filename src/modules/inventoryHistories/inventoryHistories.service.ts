import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InventoryHistoriesDocument } from './inventoryHistories.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class InventoryHistoriesService {
    constructor(
        @InjectModel('inventoryHistories') private inventoryHistoriesModel: Model<InventoryHistoriesDocument>,
    ) {

    }
    async getInventoryHistories() {
        const items = await this.inventoryHistoriesModel.find().populate('product', 'title_fa title_en img_url product_id').populate('depot');
        const count = await this.inventoryHistoriesModel.find().count();
        return {
            items,
            count
        }

    }

    async getInventoryHistory(id: string) {
        const inventoryHistory = await this.inventoryHistoriesModel.findOne({ _id: id }).populate('product', 'title_fa title_en img_url product_id').populate('depot');
        if (!inventoryHistory) {
            throw new NotFoundException()
        }
        return inventoryHistory
    }
}
