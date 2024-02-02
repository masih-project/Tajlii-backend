import { Module } from '@nestjs/common';
import { ContactUsService } from './services/contactus.service';
import { ContactUsController } from './contactus.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactUs, ContactUsSchema } from './schemas/contactus.schema';
import { JWTUtils } from '@$/utils/jwt-utils';

@Module({
  imports: [MongooseModule.forFeature([{ name: ContactUs.name, schema: ContactUsSchema }])],
  controllers: [ContactUsController],
  providers: [ContactUsService, JWTUtils],
  exports: [ContactUsService],
})
export class ContactusModule {}
