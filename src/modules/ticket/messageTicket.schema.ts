import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Type } from 'typescript';
export type messageTicketDocument = HydratedDocument<MessageTicket> & any;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class MessageTicket {
  @Prop({ default: '', type: String })
  message: string;
  @Prop({ default: '', type: String })
  file: string;
  @Prop({ default: '', type: Types.ObjectId, ref: 'users' })
  user_reply: Types.ObjectId;
  @Prop({ default: '', type: Types.ObjectId, ref: 'admins' })
  admin_reply: Types.ObjectId;
  @Prop({ default: '', type: Types.ObjectId, ref: 'tickes' })
  ticket_id: Types.ObjectId;
}
export const messageTicketSchema = SchemaFactory.createForClass(MessageTicket);
