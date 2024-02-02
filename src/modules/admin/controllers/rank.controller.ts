import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RankService } from '@$/modules/rank/rank.service';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { CreateRankByAdminDto } from '@$/modules/rank/dto/createRankByadmin.dto';
import { UpdateRankByAdminDto } from '@$/modules/rank/dto/updateRankByAdmin.dto';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { QueryRankByAdminDto } from '@$/modules/rank/dto/queryRankByAdmin.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@Controller('admin/rank')
@ApiTags('admin/rank')
export class RankController {
  constructor(private rankService: RankService) {}

  @Post('/')
  @HasPermissions('Create.Rank')
  async createRankByAdmin(@Body() body: CreateRankByAdminDto) {
    return this.rankService.createRankByAdmin(body);
  }

  @Patch('/:id')
  @HasPermissions('Update.Rank')
  async updateRankByAdmin(@Body() body: UpdateRankByAdminDto, @Param('id', ParseObjectIdPipe) id: string) {
    return this.rankService.updateRankByAdmin(id, body);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Rank')
  async deleteRankByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.rankService.deleteRankByAdmin(id);
  }

  @Get('/:id')
  @HasPermissions('Read.Rank')
  async getRankByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.rankService.getRankByAdmin(id);
  }

  @Get('/')
  @HasPermissions('Read.Rank')
  async getRanksByAdmin(@Query() query: QueryRankByAdminDto) {
    return this.rankService.getRanksByAdmin(query);
  }
}
