import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Complaint, ComplaintSchema } from './schemas/complaint.schema';
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './services/complaint.service';
import { SmsUtils } from '@$/utils/sm-utils';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Complaint.name, schema: ComplaintSchema }]), AuditModule],
  controllers: [ComplaintController],
  providers: [ComplaintService, SmsUtils],
  exports: [ComplaintService],
})
export class ComplaintModule {}
