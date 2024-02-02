import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controllers/admin.controller';
import { adminSchema } from './schemas/admin.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { userSchema } from 'src/modules/user/schema/user.schema';
import { cartSchema } from 'src/modules/cart/cart.schema';
import { productSchema } from '@$/modules/product/schemas/product.schema';
import { AuthModule } from 'src/modules/Auth/auth.module';
import { AdminService } from './services/admin.service';
import { JWTUtils } from 'src/utils/jwt-utils';
import { HashUtils } from 'src/utils/hast-utils';
import { AuthService } from 'src/modules/Auth/auth.service';
import { EmailUtils } from 'src/utils/email-utils';
import { OtpUtils } from 'src/utils/otp-utils';
import { LoggerUtils } from 'src/utils/logger-utils';
import { SmsUtils } from 'src/utils/sm-utils';
import { JwtModule } from '@nestjs/jwt';
import { AdminGuard } from './guards/admin.guard';
import { AdminAccessTokenStrategy } from './guards/access-token.strategy';
import { BrandController } from './controllers/brand.controller';
import { BrandModule } from 'src/modules/brand/brand.module';
import { EchantillonController } from './controllers/echantillon.controller';
import { CategoryController } from './controllers/category.controller';
import { AshantionModule } from '@$/modules/ashantion/ashantion.module';
import { CategoryModule } from '@$/modules/category/category.module';
import { CouponController } from './controllers/coupun.controller';
import { CopunModule } from '@$/modules/copun/copun.module';
import { LayoutController } from './controllers/layout.controller';
import { RoleModule } from '../role/role.module';
import { LayoutModule } from '../layout/layout.module';
import { AdminAuthController } from './controllers/auth.controller';
import { DepotModule } from '../Depot/depot.module';
import { CommentModule } from '../comment/comment.module';
import { NetworkController } from './controllers/network.controller';
import { NetworkModule } from '../network/network.module';
import { OrderModule } from '../order/order.module';
import { OrderController } from './controllers/order.controller';
import { PublicUtils } from '@$/utils/public-utils';
import { CommentController } from './controllers/comment.controller';
import { DepotController } from './controllers/depot.controller';
import { PeriodController } from './controllers/period.controller';
import { ProductController } from './controllers/product.controller';
import { PeriodModule } from '../period/period.module';
import { ProductModule } from '../product/product.module';
import { RankModule } from '../rank/rank.module';
import { RankController } from './controllers/rank.controller';
import { RewardModule } from '../reward/reward.module';
import { RewardController } from './controllers/reward.controller';
import { RoleController } from './controllers/role.controller';
import { SettingController } from './controllers/setting.controller';
import { SettingModule } from '../settings/setting.module';
import { TicketController } from './controllers/ticket.controller';
import { TicketModule } from '../ticket/ticket.module';
import { TransactionModule } from '../transaction/transaction.module';
import { UserModule } from '../user/user.module';
import { UserController } from './controllers/user.controller';
import { ComplaintController } from './controllers/complaint.controller';
import { ComplaintModule } from '../complaint/complaint.module';
import { DepartmentModule } from '../department/department.module';
import { DepartmentController } from './controllers/department.controller';
import { CampaignModule } from '../campaign/campaign.module';
import { CampaignController } from './controllers/campaign.controller';
import { ContactusController } from './controllers/contactus.controller';
import { ContactusModule } from '../contact-us/contactus.module';
import { CategoryBlogController } from './controllers/categoryBlog.controller';
import { BlogModule } from '../blog/blog.module';
import { CategoryBlogModule } from '../categoryBlog/categoryBlog.module';
import { BlogController } from './controllers/blog.controller';
import { ReportController } from './controllers/report.controller';
import { ContractController } from './controllers/contract.controller';
import { ContractModule } from '../contract/contract.module';
import { BlogCommentController } from './controllers/commentBlog.controller';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { InventoryHistoriesController } from './controllers/inventoryHistories';
import { InventoyHistoriesModule } from '../inventoryHistories/inventoryHistories.module';
import { TransactionController } from './controllers/transaction.controller';
import { CustomPlanModule } from '../custom-plan/custom-plan.module';
import { LedgerController } from './controllers/ledger.controller';
//============================================================================

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: 'carts', schema: cartSchema },
      { name: 'products', schema: productSchema },
    ]),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ADMIN_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get('ADMIN_ACCESS_TOKEN_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
    RoleModule,
    BrandModule,
    AshantionModule,
    CategoryModule,
    CopunModule,
    LayoutModule,
    DepartmentModule,
    DepotModule,
    CommentModule,
    NetworkModule,
    OrderModule,
    PeriodModule,
    ProductModule,
    RankModule,
    RewardModule,
    SettingModule,
    TicketModule,
    TransactionModule,
    UserModule,
    ComplaintModule,
    CampaignModule,
    ContactusModule,
    CategoryBlogModule,
    BlogModule,
    ContractModule,
    InventoryModule,
    InventoyHistoriesModule,
    CustomPlanModule,
  ],
  controllers: [
    AdminAuthController,
    EchantillonController,
    BrandController,
    CategoryController,
    DepartmentController,
    CommentController,
    ComplaintController,
    CouponController,
    DepotController,
    LayoutController,
    NetworkController,
    OrderController,
    PeriodController,
    ProductController,
    RankController,
    RewardController,
    RoleController,
    SettingController,
    TicketController,
    UserController,
    CampaignController,
    ContactusController,
    CategoryBlogController,
    BlogController,
    BlogCommentController,
    ReportController,
    ContractController,
    InventoryController,
    InventoryHistoriesController,
    TransactionController,
    LedgerController,
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    AdminController, // must be the last controller!
  ],
  providers: [
    AdminAccessTokenStrategy,
    AdminGuard,
    AdminService,
    JWTUtils,
    HashUtils,
    AuthService,
    EmailUtils,
    HashUtils,
    OtpUtils,
    LoggerUtils,
    SmsUtils,
    PublicUtils,
  ],
  exports: [],
})
export class AdminModule {}
