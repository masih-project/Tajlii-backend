import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { proviceSchema } from './provice.schema';
import { ProvinceController } from './Province.controller';
import { ProvinceService } from './province.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'provinces', schema: proviceSchema }])],
  controllers: [ProvinceController],
  providers: [ProvinceService],
})
export class ProvinceModule {}
