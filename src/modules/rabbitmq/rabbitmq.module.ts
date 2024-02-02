import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RabbitPublisherService } from './rabbit-publisher.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogAndMapResponseInterceptor } from '@$/common/interceptors/log-and-map-response.interceptor';
import { SmsUtils } from '@$/utils/sm-utils';
import { CustomPlanService } from '../custom-plan/custom-plan.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'RABBITMQ_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            persistent: true,
            // noAck: true, // for manual or auto confirmation
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'HistQ',
            queueOptions: {
              durable: true,
            },
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'SAMRTCITY_RABBIT',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            persistent: true,
            // noAck: true, // for manual or auto confirmation
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'SmartCityQueue',
            queueOptions: {
              durable: true,
            },
          },
        });
      },
      inject: [ConfigService],
    },
    RabbitPublisherService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogAndMapResponseInterceptor,
    },
    SmsUtils,
    CustomPlanService,
  ],
  exports: [RabbitPublisherService, CustomPlanService],
})
export class RabbitmqModule {}
