import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { userSchema } from '../user/schema/user.schema';
import { PeriodController } from './period.controller';
import { periodSchema } from './period.schema';
import { PeriodService } from './period.service';
import { adminSchema } from '../admin/schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'periods', schema: periodSchema },
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
    ]),
  ],
  controllers: [PeriodController],
  providers: [PeriodService, JWTUtils],
  exports: [PeriodService],
})
export class PeriodModule {}
