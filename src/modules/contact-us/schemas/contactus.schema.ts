import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

// export const ConcernTypeItems = ['رفع لک و جای جوش', 'جوانسازی و رفع چین و چروک', 'کسب اطلاعات بیشتر'];
// export type ConcernType = (typeof ConcernTypeItems)[number];
@Schema({ timestamps: true, versionKey: false })
export class ContactUs {
  @Prop({ type: ObjectId, ref: 'users' })
  user?: ObjectId;

  @Prop({ required: true })
  phone: string;

  @Prop({})
  fullname: string;

  @Prop({})
  email?: string;

  @Prop({})
  text?: string;

  @Prop({ default: 'Consultation' })
  type: string;

  @Prop({ type: raw({}) })
  metadata: {
    age?: number;
    concern?: string[];
  };

  //
  createdAt: Date;
  updatedAt: Date;
}
export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);
export type ContactUsDocument = HydratedDocument<ContactUs>;
