import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type notificationDocument = HydratedDocument<Notification>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Notification {
  @Prop({ default: '', type: String })
  message: string;
  @Prop({ default: false, type: Boolean })
  is_view: boolean;
  @Prop({ default: [], type: Types.ObjectId, ref: 'users' })
  receivers: Types.ObjectId[] | string[];
}
export const notificationSchema = SchemaFactory.createForClass(Notification);
