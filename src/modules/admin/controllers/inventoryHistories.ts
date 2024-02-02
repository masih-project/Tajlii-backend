import { UseGuards, Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../guards/admin.guard";
import { InventoryHistoriesService } from "@$/modules/inventoryHistories/inventoryHistories.service";
import { ParseObjectIdPipe } from "@$/common/pipes/parse-objectid.pipe";

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@Controller('admin/inventoryHistories')
@ApiTags('admin/inventoryHistories')
export class InventoryHistoriesController {
    constructor(
        private inventoryHistoriesService: InventoryHistoriesService
    ) {


    }
    @Get('')
    async getInventoryHistories() {
        return await this.inventoryHistoriesService.getInventoryHistories();
    }

    @Get('/:id')
    async getInventoryHistory(@Param('id', ParseObjectIdPipe) id: string) {
        return await this.inventoryHistoriesService.getInventoryHistory(id);
    }
}