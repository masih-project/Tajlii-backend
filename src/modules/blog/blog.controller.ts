import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { RatingBlog } from './dto/rating-blog.dto';
import { GetUser } from '@$/common/decorators/get-user.decorator';
import { QueryBlog } from './dto/query-blog.dto';
import { UserAuthGuard, UserOptionalGuard } from '@$/guard/userAuth.guard';
import { RequestUserWithAuth, UserAuth } from '@$/types/authorization.types';
import { Response } from 'express';
import { CreateCommentBlogDto } from './dto/create-comment-blog.dto';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UserDocument } from '../user/schema/user.schema';

@ApiTags('Blog')
@Controller('/blog')
export class BlogController {
  constructor(private blogService: BlogService) {}
  @Get('/')
  async getBlogs(@Query() query: QueryBlog) {
    return await this.blogService.getBlogs(query);
  }

  @Get('/:slug')
  @ApiBearerAuth('access-token')
  @UseGuards(UserOptionalGuard)
  async getBlog(@Param('slug') slug: string, @Req() req: RequestUserWithAuth, @Res() res: Response) {
    const user = req.user;
    let { session_id } = req.cookies;
    if (!session_id) {
      const headers: any = res.getHeaders();
      const cookies: any = headers['set-cookie'];
      const cookie = cookies.split(';');
      const [, session_id_value] = cookie[0].split('session_id=');
      session_id = session_id_value;
    }
    const blog = await this.blogService.getBlog(slug, user._id, session_id);
    return res.json({
      success: true,
      data: blog,
    });
  }

  @Post('/rating')
  @ApiBearerAuth('access-token')
  @UseGuards(UserAuthGuard)
  async ratingBlog(@GetUser() user: UserAuth, @Body() body: RatingBlog) {
    return await this.blogService.ratingBlog(user?._id, body);
  }
  @Post('/comment')
  @ApiBearerAuth('access-token')
  @UseGuards(UserAuthGuard)
  async createCommentBlog(@GetUser() user: UserAuth, @Body() body: CreateCommentBlogDto) {
    return await this.blogService.createCommentBlog(user?._id, body);
  }

  @Get('/:id/comment')
  async getCommentsBlog(@Param('id', ParseObjectIdPipe) id: string, @GetUser() user: UserDocument) {
    return await this.blogService.getCommentsBlog(user?._id, id);
  }
}
