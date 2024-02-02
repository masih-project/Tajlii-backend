import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Complaint } from '../schemas/complaint.schema';
import { AddComplaintDto } from '../dtos/complaint.dto';

@Injectable()
export class ComplaintService {
  constructor(@InjectModel(Complaint.name) private complaintModel: Model<Complaint>) {}

  async addComplaint(dto: AddComplaintDto) {
    return this.complaintModel.create(dto);
  }

  async getComplaint(_id: string) {
    const complaint = await this.complaintModel.findOne({ _id }).exec();
    if (!complaint) throw new NotFoundException('complaint not found');
    return complaint;
  }

  async searchComplaints() {
    const items = await this.complaintModel.find({}).exec();
    const count = await this.complaintModel.count({}).exec();
    return { items, count };
  }
}
