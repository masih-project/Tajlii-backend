import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { UserService } from '@$/modules/user/services/user.service';
import { OrderService } from '@$/modules/order/order.service';
import { TerminateRequestService } from '@$/modules/user/services/terminate-request.service';
import { RewardService } from '@$/modules/reward/reward.service';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/report')
@Controller('admin/report')
export class ReportController {
  constructor(
    private readonly userService: UserService,
    private readonly terminateService: TerminateRequestService,
    private readonly orderService: OrderService,
    private readonly rewardService: RewardService,
  ) {}

  @Get('/user-registration')
  @ApiOkResponse({})
  async userRegistration() {
    return this.userService.userRegistrationReport();
  }
  @Get('/user-status')
  @ApiOkResponse({})
  async userStatus() {
    return this.userService.userStatusReport();
  }

  @Get('/terminate-request')
  @ApiOkResponse({})
  async terminateRequest() {
    return this.terminateService.terminationRequestReport();
  }

  @Get('/orders')
  @ApiOkResponse({})
  async ordersReport() {
    return this.orderService.getOrdersReport();
  }

  @Get('/rewards')
  @ApiOkResponse({})
  async rewardsreport() {
    return this.rewardService.rewardsReport();
  }
}
