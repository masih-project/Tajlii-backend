import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Layout, LayoutSchema } from './schemas/layout.schema';
import { LayoutController as LayoutController } from './layout.controller';
import { LayoutService as LayoutService } from './services/layout.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Layout.name, schema: LayoutSchema }])],
  controllers: [LayoutController],
  providers: [LayoutService],
  exports: [LayoutService],
})
export class LayoutModule {}
