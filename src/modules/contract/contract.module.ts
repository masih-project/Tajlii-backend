import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractController } from './contract.controller';
import { Contract, ContractSchema } from './schemas/contract.schema';
import { LegalContract, LegalContractSchema } from './schemas/legal-contract.schema';
import { NaturalContract, NaturalContractSchema } from './schemas/natural-contract.schema';
import { ContractService } from './services/contract.service';
import { SmsUtils } from '@$/utils/sm-utils';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Contract.name,
        schema: ContractSchema,
        discriminators: [
          { name: LegalContract.name, schema: LegalContractSchema },
          { name: NaturalContract.name, schema: NaturalContractSchema },
        ],
      },
    ]),
  ],
  controllers: [ContractController],
  providers: [ContractService, SmsUtils],
  exports: [ContractService],
})
export class ContractModule {}
