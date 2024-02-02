import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Complaint, ComplaintDocument } from '../schemas/complaint.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuditStreamService implements OnModuleInit {
  constructor(@InjectModel(Complaint.name) private schemaModel: Model<ComplaintDocument>) {}

  onModuleInit() {
    this.schemaModel.collection.watch<ComplaintDocument>().on('change', (e) => {
      console.info(e);
    });
  }
}
