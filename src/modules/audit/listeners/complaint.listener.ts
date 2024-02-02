import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ComplaintEvent } from '../events/complaint.event';

@Injectable()
export class ComplaintListener {
  @OnEvent('xxx')
  handleOrderCreatedEvent(event: ComplaintEvent) {
    // handle and process "OrderCreatedEvent" event
  }
}
