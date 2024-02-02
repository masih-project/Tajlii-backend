import { DepartmentModule } from './modules/department/department.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/Auth/auth.module';
import { ProvinceModule } from './modules/province/provinces.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { DepotModule } from './modules/Depot/depot.module';
import { ProductModule } from './modules/product/product.module';
import { CommentModule } from './modules/comment/comment.module';
import { BookMarkModule } from './modules/bookMark/bookMark.module';
import { AddressModule } from './modules/address/address.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { CopunModule } from './modules/copun/copun.module';
import { PaymentModule } from './modules/payment/payment.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './modules/Cron/cron.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { CookieMiddleware } from './guard/cookie.guard';
import { RankModule } from './modules/rank/rank.module';
import { RewardModule } from './modules/reward/reward.module';
import { SettingModule } from './modules/settings/setting.module';
import { NetworkModule } from './modules/network/network.module';
import { PeriodModule } from './modules/period/period.module';
import { AshantionModule } from './modules/ashantion/ashantion.module';
import { AdminModule } from './modules/admin/admin.module';
import { RoleModule } from './modules/role/role.module';
import { LayoutModule } from './modules/layout/layout.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { RabbitmqModule } from './modules/rabbitmq/rabbitmq.module';
import { AuditModule } from './modules/audit/audit.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { ContactusModule } from './modules/contact-us/contactus.module';
import { CategoryBlogModule } from './modules/categoryBlog/categoryBlog.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContractModule } from './modules/contract/contract.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomPlanModule } from './modules/custom-plan/custom-plan.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('SASINNET_MONGO_URL'),
      }),
    }),
    RabbitmqModule,
    AuthModule,
    ProvinceModule,
    UserModule,
    AdminModule,
    BrandModule,
    CategoryModule,
    DepotModule,
    ProductModule,
    CommentModule,
    BookMarkModule,
    AddressModule,
    CartModule,
    OrderModule,
    CopunModule,
    PaymentModule,
    TransactionModule,
    CronModule,
    TicketModule,
    RankModule,
    RewardModule,
    SettingModule,
    NetworkModule,
    PeriodModule,
    DepartmentModule,
    AshantionModule,
    RoleModule,
    LayoutModule,
    ComplaintModule,
    AuditModule,
    CampaignModule,
    ContactusModule,
    CategoryBlogModule,
    BlogModule,
    ContractModule,
    InventoryModule,
    CustomPlanModule,
  ],
  controllers: [],
  // providers: [
  //   {
  //     provide: APP_INTERCEPTOR,
  //     useClass: LoggingInterceptor,
  //   },
  // ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieMiddleware).forRoutes('*');
    console.log('NODE_ENV ============>', process.env.NODE_ENV);
  }
}
