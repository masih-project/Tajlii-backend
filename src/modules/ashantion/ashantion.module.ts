import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from '../user/schema/user.schema';
import { adminSchema } from '../admin/schemas/admin.schema';
import { ashantionSchema } from './ashantion.schema';
import { AshantionController } from './ashantion.controller';
import { AshantionService } from './ashantion.service';
import { JWTUtils } from 'src/utils/jwt-utils';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'users',
        schema: userSchema,
      },
      {
        name: 'admins',
        schema: adminSchema,
      },
      {
        name: 'ashantions',
        schema: ashantionSchema,
      },
    ]),
  ],
  controllers: [AshantionController],
  providers: [AshantionService, JWTUtils],
  exports: [AshantionService],
})
export class AshantionModule {}
