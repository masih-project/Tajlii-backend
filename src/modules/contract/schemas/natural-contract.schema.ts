import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ContractType } from './contract.schema';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class NaturalContract {
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
}
export const NaturalContractSchema = SchemaFactory.createForClass(NaturalContract);
export type NaturalContractDocument = HydratedDocument<NaturalContract>;
