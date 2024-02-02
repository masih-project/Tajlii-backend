import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
export type copunDocument = HydratedDocument<Copun> & any;
@Schema({
  versionKey: false,
  timestamps: true,
})
export class Copun {
  @Prop({ default: '', type: String })
  name: string;
  @Prop({ default: '', type: String })
  value: string;
  @Prop({ required: true, type: Number })
  count: number;
  @Prop({ default: 0, type: Number })
  type: number;
  @Prop({ default: '', type: String })
  start_date: string;
  @Prop({ default: '', type: String })
  finish_date: string;
  @Prop({ type: Number, default: 0 })
  count_used: number;
}
export const copunSchema = SchemaFactory.createForClass(Copun);
