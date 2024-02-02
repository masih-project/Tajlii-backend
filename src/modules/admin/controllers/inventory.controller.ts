import { UseGuards, Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { CreateInventoryDto } from '@$/modules/inventory/dto/create-inventory.dto';
import { InventoryService } from '@$/modules/inventory/inventory.service';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { updateInventoryDto } from '@$/modules/inventory/dto/update-inventory.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@Controller('admin/inventory')
@ApiTags('admin/inventory')
export class InventoryController {
    constructor(
        private readonly inventoryService: InventoryService
    ) {

    }
    @Post('/')
    async createInventoryByAdmin(@Body() body: CreateInventoryDto) {
        return await this.inventoryService.createInventoryByAdmin(body);
    }
    @Get('/')
    async getInventories() {
        return await this.inventoryService.getInventories()
    }

    @Get('/:id')
    async getInventory(@Param('id', ParseObjectIdPipe) id: string) {
        return await this.inventoryService.getInventory(id);
    }

    @Patch('/:id')
    async updateInventory(@Param('id') id: string, @Body() body: updateInventoryDto) {
        return await this.inventoryService.updateInventory(id, body)
    }

}
