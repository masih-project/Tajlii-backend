import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Button, Card, Footer, MiddleBanner, Navbar, Slider, TopBanner } from '../types';
import { Admin } from '@$/modules/admin/schemas/admin.schema';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Layout {
  @Prop({ default: false })
  isActive: boolean;

  @Prop({
    type: raw({
      image: { type: String },
      link: { type: String },
      title: { type: String },
    }),
    _id: false,
    required: true,
  })
  topBanner: TopBanner;

  @Prop({ required: true })
  navbar: Navbar;

  @Prop({ required: true })
  topSlider: Slider[];

  @Prop({ required: true })
  middleBanner: MiddleBanner;

  @Prop({ required: true })
  textCards: Card[];
  @Prop({ required: true })
  imageCards: Card[];

  @Prop({ required: true })
  signupButton: Button;
  @Prop({ required: true })
  incomePlanButton: Button;

  @Prop({ required: true })
  footer: Footer;

  @Prop({
    type: Types.ObjectId,
    ref: Admin.name,
  })
  updatedBy: Admin;
}
export const LayoutSchema = SchemaFactory.createForClass(Layout);
export type LayoutDocument = HydratedDocument<Layout>;
