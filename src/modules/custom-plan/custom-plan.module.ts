import { Module } from '@nestjs/common';
import { CustomPlanService } from './custom-plan.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CustomPlanService],
  exports: [CustomPlanService],
})
export class CustomPlanModule {}
