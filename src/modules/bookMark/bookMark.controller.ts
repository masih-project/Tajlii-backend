import { BookMarkResponse } from './dto/bookmark.dto';
import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginateResponse } from 'src/common/decorators/api-paginate-response.decorator';
import { UserAuthGuard } from 'src/guard/userAuth.guard';
import { UserAuth } from 'src/types/authorization.types';
import { BookMarkService } from './bookMark.service';
import { QueryBookMark } from './dto/queryBookMark.dto';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { GetUser } from '@$/common/decorators/get-user.decorator';

@UseGuards(UserAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('BookMark')
@Controller('bookMark')
export class BookMarkController {
  constructor(private readonly bookMarkService: BookMarkService) {}

  @Post('/:id')
  async createBookMark(@GetUser() user: UserAuth, @Param('id', ParseObjectIdPipe) id: string) {
    return this.bookMarkService.createBookMark(id, user);
  }

  @Delete('/:id')
  async deleteBookMark(@GetUser() user: UserAuth, @Param('id', ParseObjectIdPipe) id: string) {
    return this.bookMarkService.deleteBookMark(id, user);
  }

  @Get('/')
  @ApiPaginateResponse(BookMarkResponse)
  async getBookMarks(@GetUser() user: UserAuth, @Query() input: QueryBookMark) {
    return this.bookMarkService.getBookMarks(user, input);
  }
}
