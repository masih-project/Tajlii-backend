import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuditService {
  constructor(private eventEmitter: EventEmitter2) {}

  writeLog(event: any) {
    this.eventEmitter.emit('xxx', event);
  }
}
