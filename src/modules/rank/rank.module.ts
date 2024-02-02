import { userSchema } from './../user/schema/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { rankSchema } from './rank.schema';
import { RankController } from './rank.controller';
import { RankService } from './rank.service';
import { JWTUtils } from 'src/utils/jwt-utils';
import { adminSchema } from '../admin/schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ranks', schema: rankSchema },
      { name: 'users', schema: userSchema },
      { name: 'admins', schema: adminSchema },
    ]),
  ],
  controllers: [RankController],
  providers: [RankService, JWTUtils],
  exports: [RankService],
})
export class RankModule {}
