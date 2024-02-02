import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditService } from './audit.service';
import { ComplaintListener } from './listeners/complaint.listener';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [AuditService, ComplaintListener],
  exports: [AuditService],
})
export class AuditModule {}
