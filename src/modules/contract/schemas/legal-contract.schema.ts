import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ContractType } from './contract.schema';

@Schema({
  timestamps: true,
  versionKey: false,
  discriminatorKey: 'type',
})
export class LegalContract {
  type: ContractType;
  fullname: string;
  identificationNumber: string;
  nationalCode: string;
  mobile: string;
  phone: string;
  subject: string;
  signingAgreement: string;
  isVerified?: boolean;
  assessDescription?: string;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ required: true })
  economicalCode: string;
}
export const LegalContractSchema = SchemaFactory.createForClass(LegalContract);
export type LegalContractDocument = HydratedDocument<LegalContract>;
