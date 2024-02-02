import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignBeneficiary } from '../schemas/campaign.schema';
import { CreateCampaignDto, EditCampaignDto } from '../dtos/campaign.dto';
import { UserService } from '@$/modules/user/services/user.service';
import { ObjectId } from 'mongodb';
import { UserDocument } from '@$/modules/user/schema/user.schema';
import { NetworkService } from '@$/modules/network/network.service';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    private readonly userService: UserService,
    private readonly networkService: NetworkService,
  ) {}

  async createCampaign(dto: CreateCampaignDto) {
    await this.userService.userExists(dto.manager);
    if (dto.admin) await this.userService.adminExists(dto.admin);
    if (dto.beneficiaries) {
      const marketerIds = dto.beneficiaries.map((x) => x.marketer);
      const marketers = await this.userService.getUsersById(marketerIds);
      if (marketers.length !== new Set(marketerIds).size) throw new NotFoundException('(some of) users not found');
      dto.beneficiaries = dto.beneficiaries.map((x: any) => {
        const marketer = marketers.find((m) => m._id.toString() === x.marketer);
        x.marketerNationalCode = marketer.national_code;
        return x;
      });
    }

    return this.campaignModel.create({
      ...dto,
      manager: new ObjectId(dto.manager),
      ...(dto.admin && { admin: new ObjectId(dto.admin) }),
    });
  }

  async editCampaign(_id: string, dto: EditCampaignDto) {
    if (dto.manager) await this.userService.userExists(dto.manager);
    if (dto.admin) await this.userService.adminExists(dto.admin);
    if (dto.beneficiaries) {
      const marketerIds = dto.beneficiaries.map((x) => x.marketer);
      const marketers = await this.userService.getUsersById(marketerIds);
      if (marketers.length !== new Set(marketerIds).size) throw new NotFoundException('(some of) users not found');
      dto.beneficiaries = dto.beneficiaries.map((x: any) => {
        const marketer = marketers.find((m) => m._id.toString() === x.marketer);
        x.marketerNationalCode = marketer.national_code;
        return x;
      });
    }
    const result = await this.campaignModel
      .updateOne(
        { _id },
        {
          ...dto,
          ...(dto.manager && { manager: new ObjectId(dto.manager) }),
          ...(dto.admin && { admin: new ObjectId(dto.admin) }),
        },
      )
      .exec();
    if (!result.modifiedCount) throw new NotFoundException();
    return this.campaignModel.findOne({ _id });
  }

  async deleteCampaign(_id: string) {
    const result = await this.campaignModel.deleteOne({ _id }).exec();
    if (!result.deletedCount) throw new NotFoundException('campaign not found');
    return result;
  }

  async getCampaign(_id: string) {
    const campaign = await this.campaignModel.findOne({ _id }).exec();
    if (!campaign) throw new NotFoundException('campaign not found');
    return campaign;
  }

  async getCampaignInfo(_id: string, joinAdmin?: boolean) {
    const campaign = await this.campaignModel.aggregate([
      {
        $match: { _id },
      },
      {
        $lookup: { from: 'users', localField: 'manager', foreignField: '_id', as: 'manager' },
      },
      {
        $unwind: { path: '$manager', preserveNullAndEmptyArrays: true },
      },
      {
        $project: { 'manager.password': 0 },
      },
      ...(joinAdmin
        ? [
            {
              $lookup: { from: 'admins', localField: 'admin', foreignField: '_id', as: 'admin' },
            },
            {
              $unwind: { path: '$admin', preserveNullAndEmptyArrays: true },
            },
            {
              $project: { 'admin.password': 0 },
            },
          ]
        : []),
    ]);
    if (!campaign?.length) throw new NotFoundException('campaign not found');
    if (campaign[0].beneficiaries?.length) {
      const beneficiaries: CampaignBeneficiary[] = campaign[0].beneficiaries;
      const marketers = await this.userService.getUsersById(beneficiaries.map((x) => x.marketer));
      campaign[0].beneficiaries = campaign[0].beneficiaries.map((x) => {
        return {
          ...x,
          marketer: marketers.find((m) => m._id.toString() === x.marketer.toString()),
        };
      });
    }
    return campaign[0];
  }

  async searchCampaigns() {
    return this.campaignModel.find({}).exec();
  }

  async getBeneficiary(_id: string): Promise<{ marketer: string | ObjectId; code: string }> {
    const campaign = await this.campaignModel.findOne({ _id }).populate('manager').exec();
    if (!campaign) throw new NotFoundException('campaign not found');
    if (!campaign.beneficiaries?.length)
      return {
        marketer: (campaign.manager as unknown as UserDocument)._id,
        code: (campaign.manager as unknown as UserDocument).national_code,
      };

    //
    const beneficiaries = campaign.beneficiaries.sort((a, b) => a.order - b.order);
    for (let i = 0; i < beneficiaries.length; i++) {
      const selling = await this.networkService.getCurrentPersonalSelling(beneficiaries[i].marketer);
      if (selling < beneficiaries[i].saleCeiling)
        return {
          marketer: beneficiaries[i].marketer,
          code: beneficiaries[i].marketerNationalCode,
        };
    }

    return {
      marketer: (campaign.manager as unknown as UserDocument)._id,
      code: (campaign.manager as unknown as UserDocument).national_code,
    };
  }
}

// db.getCollection("campaigns").aggregate([
//   {
//     $unwind: "$beneficiaries"
//   },
//   {
//     $lookup: {
//       from: "users",
//       let: {
//         marketer: {
//           $toObjectId: "$beneficiaries.marketer"
//         },
//         beneficiaries: "$beneficiaries"
//       },
//       pipeline: [
//         {
//           $match: {
//             $expr: {
//               $eq: [
//                 "$_id",
//                 "$$marketer"
//               ]
//             }
//           }
//         },
//         {
//           $replaceRoot: {
//             newRoot: {
//               $mergeObjects: [
//                 "$$beneficiaries",
//                 "$$ROOT"
//               ]
//             }
//           }
//         }
//       ],
//       as: "items"
//     }
//   },
//   {
//     $group: {
//       _id: "$_id",

//       items: {
//         $push: {
//           $first: "$items"
//         }
//       }
//     }
//   }
// ])
