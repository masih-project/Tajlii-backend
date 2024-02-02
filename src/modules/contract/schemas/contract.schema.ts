import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LegalContract } from './legal-contract.schema';
import { NaturalContract } from './natural-contract.schema';
import { ContractStatus } from '../types';

export const ContractTypeItems = <const>[LegalContract.name, NaturalContract.name];
export type ContractType = (typeof ContractTypeItems)[number];
@Schema({
  timestamps: true,
  versionKey: false,
  discriminatorKey: 'type',
})
export class Contract {
  @Prop({ type: String, required: true, enum: ContractTypeItems })
  type: ContractType;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true })
  identificationNumber: string;

  @Prop({ required: true })
  nationalCode: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  signingAgreement: string;

  @Prop({ type: String, default: 'Submited' })
  status?: ContractStatus;
  @Prop({})
  assessDescription?: string;

  createdAt: Date;
  updatedAt: Date;
}
export const ContractSchema = SchemaFactory.createForClass(Contract);
export type ContractDocument = HydratedDocument<Contract>;
