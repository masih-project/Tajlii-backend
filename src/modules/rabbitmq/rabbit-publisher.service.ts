import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RmqRecordBuilder, ClientRMQ } from '@nestjs/microservices';
import { IApiCallLog } from './types/api-call-log.interface';
import mongoose from 'mongoose';
import { IAuditLog } from './types/audit-log.interface';
import { BSON } from 'mongodb';
import { UserDocument } from '../user/schema/user.schema';
import { SmsUtils } from '@$/utils/sm-utils';

const ApiCallLogPattern = 'API_CALL_LOG';
const DbChangeLogPattern = 'DB_CHANGE_LOG';
const AuditLogPattern = 'AUDIT_LOG';

const DbChangeMethods = [
  'insertOne',
  'insertMany',
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
];
const VezaratRequiredModels = ['complaints', 'products', 'images', 'orders', 'networks', 'ranks', 'rewards', 'users'];

@Injectable()
export class RabbitPublisherService implements OnModuleInit {
  constructor(
    @Inject('RABBITMQ_SERVICE') private historyServiceQueue: ClientRMQ,
    @Inject('SAMRTCITY_RABBIT') private smartCityQueue: ClientRMQ,
    private readonly sms: SmsUtils,
  ) {}

  onModuleInit() {
    mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
      // if (![...DbChangeMethods, 'find', 'findOne', 'createIndex'].includes(methodName)) {
      //    console.info('unsupported method:', methodName);
      // }
      if (VezaratRequiredModels.includes(collectionName)) {
        if (DbChangeMethods.includes(methodName)) {
          console.info('DB_CHANGE_LOG', collectionName, methodName);
          this.logDbChange({ collection: collectionName, method: methodName, data: methodArgs });
          // this.auditLog({
          //   action: methodName.match(/insert/) ? 'CREATE' : methodName.match(/(u|U)pdate/) ? 'UPDATE' : 'DELETE',
          //   date:Date.now(),
          //   docId:
          // });
        }
      }
    });
  }

  logDbChange(payload: { collection: string; method: string; data: any }) {
    try {
      // console.info('logDbChange payload ===========================', payload);
      const record = new RmqRecordBuilder(BSON.serialize(payload));
      // console.info(BSON.serialize(payload), record);

      this.historyServiceQueue.emit(DbChangeLogPattern, record);
    } catch (error) {
      console.error('error', error);
    }
  }

  logApiCall(payload: IApiCallLog) {
    try {
      const record = new RmqRecordBuilder(JSON.stringify(payload));
      this.historyServiceQueue.emit(ApiCallLogPattern, record);
    } catch (error) {
      console.error('error', error);
    }
  }

  auditLog(payload: IAuditLog) {
    try {
      const record = new RmqRecordBuilder(JSON.stringify(payload));
      this.historyServiceQueue.emit(AuditLogPattern, record);
    } catch (error) {
      console.error('error', error);
    }
  }

  signupMarketer(marketer: UserDocument) {
    try {
      console.log('sending new signuped marketer to SmartCityQueue', marketer);
      const record = new RmqRecordBuilder(marketer);
      this.smartCityQueue.emit('MARKETER_SIGNUP', record);
    } catch (error) {
      console.error('error', error);
    }
  }

  updateMarketerData(code: string, marketer: EditSasinMarketerDto) {
    try {
      console.log('sending edited marketer to SmartCityQueue', marketer);
      const record = new RmqRecordBuilder({ code, marketer });
      this.smartCityQueue.emit('MARKETER_SIGNUP', record);
    } catch (error) {
      console.error('error', error);
    }
  }

  deleteMarketer(code: string) {
    try {
      console.log('sending deleted marketer marketer to SmartCityQueue', code);
      const record = new RmqRecordBuilder(code);
      this.smartCityQueue.emit('MARKETER_DELETE', record);
    } catch (error) {
      console.error('error', error);
    }
  }

  marketerReachedMinSale(nationalCode: string, mobile: string) {
    try {
      console.log('sending marketer reach min sale to SmartCityQueue', nationalCode);
      //@TODO send sms => must seperate later
      this.sms.sendWelocmeToSmartCity(mobile);

      const record = new RmqRecordBuilder(nationalCode);
      this.smartCityQueue.emit('MARKETER_REACH_MIN_SALE', record);
    } catch (error) {
      console.error('error', error);
    }
  }

  siteOrderCompleted(nationalCode: string) {
    try {
      console.log('sending site order completed to SmartCityQueue', nationalCode);
      const record = new RmqRecordBuilder(nationalCode);
      this.smartCityQueue.emit('SITE_ORDER_COMPLETED', record);
    } catch (error) {
      console.error('error', error);
    }
  }
}

export class EditSasinMarketerDto {
  nationalCode?: string;
  username?: string;
  mobile?: string;
  refererCode?: string;
  sponsorcode?: string;
}
