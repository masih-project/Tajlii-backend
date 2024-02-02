import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryDocument } from './inventory.schema';
import { updateInventoryDto } from './dto/update-inventory.dto';
import { InventoryHistoriesDocument } from '../inventoryHistories/inventoryHistories.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel('inventories') private inventoryModel: Model<InventoryDocument>,
    @InjectModel('inventoryHistories') private inventoryHistoriesModel: Model<InventoryHistoriesDocument>,
  ) {}
  async createInventoryByAdmin(body: CreateInventoryDto) {
    const inventory = await this.inventoryModel.findOne({ product: new Object(body.product) });
    const inventoryCount = inventory?.countProduct || 0;
    const count = inventoryCount + body.count;
    if (!inventory) {
      const new_inventory = await this.inventoryModel.create({
        product: new ObjectId(body.product),
        depot: new ObjectId(body.depot),
        countProduct: count,
        histories: {
          _id: new ObjectId(),
          count: body.count,
        },
      });
      console.log(new_inventory);
      const historyId = new_inventory.histories[0]._id;
      await this.inventoryHistoriesModel.create({
        depot: new ObjectId(body.depot),
        product: new ObjectId(body.product),
        finalInventory: count,
        inventoryBoost: body.count,
        history: historyId,
      });
      return;
    }
    await this.inventoryModel.updateOne(
      { _id: inventory._id },
      {
        countProduct: count,
        $push: {
          histories: {
            _id: new ObjectId(),
            count: body.count,
          },
        },
      },
    );
    const updatedInventory = await this.inventoryModel.findOne({ _id: inventory._id });
    const historyId = updatedInventory.histories[updatedInventory.histories.length - 1]._id;

    await this.inventoryHistoriesModel.create({
      depot: new ObjectId(body.depot),
      product: new ObjectId(body.product),
      finalInventory: count,
      inventoryBoost: body.count,
      history: historyId,
    });
  }

  async getInventories() {
    const items = await this.inventoryModel
      .find()
      .populate('product', 'title_fa title_en img_url product_id')
      .populate('depot');
    const count = await this.inventoryModel.find().count();
    return {
      items,
      count,
    };
  }
  async getInventory(id: string) {
    const inventory = await (
      await this.inventoryModel.findOne({ _id: id }).populate('product', 'title_fa title_en img_url product_id')
    ).populated('depot');
    if (!inventory) {
      throw new NotFoundException();
    }
    return inventory;
  }
  async updateInventory(id: string, body: updateInventoryDto) {
    const inventory = await this.inventoryModel.findOne({ _id: id });
    if (!inventory) {
      throw new NotFoundException();
    }
    await this.inventoryModel.updateOne(
      { _id: inventory._id },
      {
        $set: {
          'histories.$.count': body.count,
        },
      },
    );
    const new_inventory = await this.inventoryModel.findOne({ _id: inventory._id });
    const histories = new_inventory?.histories || [];
    const totalCount = histories.reduce((sum, i) => {
      return sum + i.count;
    }, 0);
    await this.inventoryModel.updateOne(
      { _id: inventory._id },
      {
        countProduct: totalCount,
      },
    );
    await this.inventoryHistoriesModel.updateOne(
      { product: new ObjectId(inventory.product), depot: new ObjectId(inventory.depot) },
      {
        finalInventory: totalCount,
      },
    );
    await this.inventoryHistoriesModel.updateOne(
      { product: new ObjectId(inventory.product), depot: new ObjectId(inventory.depot), history: id },
      {
        inventoryBoost: body.count,
      },
    );
  }
}
