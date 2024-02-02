import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddressLogger } from 'src/logger/address/addressLogger';
import { UserAuth } from 'src/types/authorization.types';
import { Address } from './address.schema';
import { CreateAddress } from './dto/createAddress.dto';
import { UpdateAddress } from './dto/updateAddress.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel('addresses') private addressModel: Model<Address>,
    private readonly addressLogger: AddressLogger,
  ) {}
  async createAddress(user: UserAuth, body: CreateAddress) {
    return this.addressModel.create({
      ...body,
      user: new ObjectId(user._id),
      city_id: body.city_id,
    });
  }
  async deleteAddress(user: UserAuth, id: string) {
    const address = await this.addressModel.findOne({ _id: id });
    if (!address) {
      throw new BadRequestException('آیتمی یافت نشد');
    }
    return this.addressModel.deleteOne({ _id: id });
  }
  async getAddress(user: UserAuth, id: string) {
    const address = await this.addressModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          user: new ObjectId(user._id),
        },
      },
      {
        $lookup: {
          from: 'provinces', // Collection name for cities
          localField: 'city_id',
          foreignField: 'cities._id',
          as: 'province',
        },
      },
      {
        $unwind: {
          path: '$province',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          'province.city': {
            $filter: {
              input: '$province.cities',
              cond: {
                $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
              },
            },
          },
        },
      },
      {
        $unwind: {
          path: '$province.city',
        },
      },
      {
        $project: {
          first_name: '$first_name',
          last_name: '$last_name',
          mobile: '$mobile',
          postal_code: '$postal_code',
          address: '$address',
          province: {
            _id: '$province._id',
            name: '$province.name',
            city: '$province.city',
          },
        },
      },
    ]);
    if (address.length === 0) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return address[0];
  }
  async getAddresses(user: UserAuth) {
    const items = await this.addressModel.aggregate([
      {
        $match: {
          user: new ObjectId(user._id),
        },
      },
      {
        $lookup: {
          from: 'provinces', // Collection name for cities
          localField: 'city_id',
          foreignField: 'cities._id',
          as: 'province',
        },
      },
      {
        $unwind: {
          path: '$province',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          'province.city': {
            $filter: {
              input: '$province.cities',
              cond: {
                $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
              },
            },
          },
        },
      },
      {
        $unwind: {
          path: '$province.city',
        },
      },
      {
        $project: {
          first_name: '$first_name',
          last_name: '$last_name',
          mobile: '$mobile',
          postal_code: '$postal_code',
          address: '$address',
          province: {
            _id: '$province._id',
            name: '$province.name',
            city: '$province.city',
          },
        },
      },

      // { $unset: "$province.cities" }
    ]);
    const count = await this.addressModel.find({ user: user._id }).count();
    const addresses = await this.addressModel.find();
    // for (let address of addresses) {
    //   const address_item = await this.addressModel.findOne({ _id: address._id });
    //   if (address_item) {
    //     await this.addressModel.updateOne({ _id: address._id }, {
    //       province_id: new ObjectId(address.province_id),
    //       city_id: String(address.city_id),
    //     })
    //   }
    // }
    return {
      items,
      count,
    };
  }
  async updateAddress(id: string, input: UpdateAddress, user: UserAuth) {
    const address = await this.addressModel.findOne({ _id: id });
    if (!address) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.addressModel.updateOne(
      { __id: id },
      {
        ...input,
      },
    );
  }
}
