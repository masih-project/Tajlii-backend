import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdminModule } from './modules/admin/admin.module';
import { AddressModule } from './modules/address/address.module';
import { AshantionModule } from './modules/ashantion/ashantion.module';
import { AuthModule } from './modules/Auth/auth.module';
import { BookMarkModule } from './modules/bookMark/bookMark.module';
import { BrandModule } from './modules/brand/brand.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoryModule } from './modules/category/category.module';
import { CommentModule } from './modules/comment/comment.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { CopunModule } from './modules/copun/copun.module';
import { DepotModule } from './modules/Depot/depot.module';
import { LayoutModule } from './modules/layout/layout.module';
import { NetworkModule } from './modules/network/network.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PeriodModule } from './modules/period/period.module';
import { ProductModule } from './modules/product/product.module';
import { ProvinceModule } from './modules/province/provinces.module';
import { RankModule } from './modules/rank/rank.module';
import { RewardModule } from './modules/reward/reward.module';
import { RoleModule } from './modules/role/role.module';
import { SettingModule } from './modules/settings/setting.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UserModule } from './modules/user/user.module';
import { RabbitmqModule } from './modules/rabbitmq/rabbitmq.module';
import { DepartmentModule } from './modules/department/department.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { ContactusModule } from './modules/contact-us/contactus.module';
import { CategoryBlogModule } from './modules/categoryBlog/categoryBlog.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContractModule } from './modules/contract/contract.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { InventoyHistoriesModule } from './modules/inventoryHistories/inventoryHistories.module';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Sasinnet Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: ``,
        name: 'authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [
      RabbitmqModule,
      AddressModule,
      AshantionModule,
      AuthModule,
      BookMarkModule,
      BrandModule,
      CartModule,
      CategoryModule,
      DepartmentModule,
      CommentModule,
      ComplaintModule,
      CopunModule,
      DepotModule,
      LayoutModule,
      NetworkModule,
      NotificationModule,
      OrderModule,
      PaymentModule,
      PeriodModule,
      ProductModule,
      ProvinceModule,
      RankModule,
      RewardModule,
      RoleModule,
      SettingModule,
      TicketModule,
      TransactionModule,
      UserModule,
      CampaignModule,
      ContactusModule,
      CategoryBlogModule,
      BlogModule,
      ContractModule,
      InventoryModule,
      InventoyHistoriesModule,
    ],
  });
  SwaggerModule.setup('/sasinnet-site-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const options = new DocumentBuilder()
    .setTitle('Sasinnet Admin Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        name: 'Admin-Access-Token',
        type: 'oauth2',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        flows: {
          password: {
            tokenUrl: '/api/v1/admin/auth/oauth2-login',
            refreshUrl: '/api/v1/admin/auth/refresh-token',
            scopes: {},
          },
        },
      },
      'Admin-Access-Token',
    )
    .build();
  const adminDocument = SwaggerModule.createDocument(app, options, {
    include: [AdminModule],
  });
  SwaggerModule.setup('/sasinnet-admin-docs', app, adminDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
