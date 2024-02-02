import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAuth } from 'src/types/authorization.types';
import { CommentService } from './commentService';
import { CreateCommentDto } from './dto/createComment';
import { UserAuthGuard } from '@$/guard/userAuth.guard';
import { GetUser } from '@$/common/decorators/get-user.decorator';

@ApiBearerAuth('access-token')
@UseGuards(UserAuthGuard)
@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/')
  async createCommentByProduct(@GetUser() user: UserAuth, @Body() body: CreateCommentDto) {
    return this.commentService.createCommentByProduct(body, user);
  }
}
