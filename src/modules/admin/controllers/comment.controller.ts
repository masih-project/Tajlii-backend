import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { CommentService } from '@$/modules/comment/commentService';
import { ApiPaginateResponse } from '@$/common/decorators/api-paginate-response.decorator';
import { CommentResponse } from '@$/modules/comment/dto/comment.dto';
import { QueryCommentByAdmin } from '@$/modules/comment/dto/queryCommentByAdmin';
import { UpdateCommentDto } from '@$/modules/comment/dto/updateComment';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { CreateCommentByAdminDto } from '@$/modules/comment/dto/create-comment-admin.dto';
import { GetAdmin } from '@$/common/decorators/get-admin.decorator';
import { AdminDocument } from '../schemas/admin.schema';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/comment')
@Controller('admin/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @Get('/')
  @HasPermissions('Read.Comment')
  @ApiPaginateResponse(CommentResponse)
  async getCommentsByAdmin(@Query() query: QueryCommentByAdmin) {
    return this.commentService.getCommentsByAdmin(query);
  }
  @Get('/:id')
  @HasPermissions('Read.Comment')
  @ApiPaginateResponse(CommentResponse)
  async getCommentByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.commentService.getCommentByAdmin(id);
  }

  @Post('/:id')
  @HasPermissions('Read.Comment')
  @ApiPaginateResponse(CommentResponse)
  async createCommentByAdmin(@GetAdmin() admin: AdminDocument, @Body() body: CreateCommentByAdminDto, @Param('id', ParseObjectIdPipe) id: string) {
    return this.commentService.createCommentByAdmin(id, body, admin);
  }

  @Patch('/:id')
  @HasPermissions('Update.Comment')
  async updateCommentByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateCommentDto) {
    return this.commentService.updateCommentByAdmin(id, body);
  }
}
