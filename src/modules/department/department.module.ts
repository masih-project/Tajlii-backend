import { DepartmentController } from './department.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicUtils } from 'src/utils/public-utils';
import { adminSchema } from '../admin/schemas/admin.schema';
import { DepartmentService } from './department.service';
import { departmentSchema } from './department.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'admins', schema: adminSchema },
      { name: 'departments', schema: departmentSchema },
    ]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService, PublicUtils],
  exports: [DepartmentService],
})
export class DepartmentModule {}
