import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type ticketDocument = HydratedDocument<Ticket>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Message {
  @Prop()
  text: string;

  @Prop()
  files: string[];

  @Prop({ default: '', type: Types.ObjectId, ref: 'users' })
  sender_user: Types.ObjectId;

  @Prop({ default: null, type: Types.ObjectId, ref: 'admins' })
  sender_admin: Types.ObjectId;
}

export const messageSchema = SchemaFactory.createForClass(Message);

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Ticket {
  @Prop({ default: null, type: Types.ObjectId, ref: 'users' })
  sender_user: Types.ObjectId;

  @Prop({ default: null, type: Types.ObjectId, ref: 'admins' })
  sender_admin: Types.ObjectId;

  @Prop({ default: null, type: String })
  subject: string;

  @Prop({ default: '', type: String })
  importance: string;

  @Prop({ default: null, type: Types.ObjectId, ref: 'users' })
  receiver_user: Types.ObjectId;

  @Prop({ default: null, type: Types.ObjectId, ref: 'departments' })
  department: Types.ObjectId;
  @Prop({ default: 0, type: Number })
  status: number;

  @Prop({ default: '', type: String })
  ticket_code: string;

  @Prop({ type: [messageSchema] })
  messages: Message[];
}
export const ticketSchema = SchemaFactory.createForClass(Ticket);
