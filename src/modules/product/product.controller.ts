import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiItemResponse } from 'src/common/decorators/api-item-response.decorator';
import { ApiPaginateResponse } from 'src/common/decorators/api-paginate-response.decorator';
import { CardUserAuthGuard } from 'src/guard/cardUserAuth.guard';
import { UserAuthGuard, UserOptionalGuard } from 'src/guard/userAuth.guard';
import { RequestUserWithAuth, UserAuth } from 'src/types/authorization.types';
import { ProductResponse } from './dto/product.dto';
import { QueryComment } from './dto/queryComment.dto';
import { QueryProduct } from './dto/queryProduct.dto';
import { RatingProduct } from './dto/ratingProduct.dto';
import { ProductService } from './services/product.service';
import { GetUser } from '@$/common/decorators/get-user.decorator';

@ApiTags('Product')
@Controller('/Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('')
  @ApiBearerAuth('access-token')
  @UseGuards(CardUserAuthGuard)
  @ApiPaginateResponse(ProductResponse)
  async getProducts(@Res() res: Response, @Query() query: QueryProduct, @Req() req: RequestUserWithAuth) {
    const user = req.user;
    let { session_id } = req.cookies;
    if (!session_id) {
      const headers: any = res.getHeaders();
      const cookies: any = headers['set-cookie'];
      const cookie = cookies.split(';');
      const [, session_id_value] = cookie[0].split('session_id=');
      session_id = session_id_value;
    }
    const products = await this.productService.getProducts(query, session_id, user);
    return res.json({ success: true, data: products });
  }

  @Get('/:id/comment')
  async getCommentsByProduct(@Param('id') id: string, @Query() query: QueryComment) {
    return this.productService.getCommentsByProduct(id, query);
  }

  @Get('/:id/recommend')
  @ApiPaginateResponse(ProductResponse)
  async getRecommendProducts(@Param('id') id: string) {
    return this.productService.getRecommendProducts(id);
  }

  @Post('/rating')
  @ApiBearerAuth('access-token')
  @UseGuards(UserAuthGuard)
  async ratingProduct(@GetUser() user: UserAuth, @Body() body: RatingProduct) {
    return this.productService.rateProduct(body, user);
  }

  @Get('/:id/status')
  @ApiBearerAuth('access-token')
  @UseGuards(UserAuthGuard)
  async getStatusProduct(@GetUser() user: UserAuth, @Param('id') id: string) {
    return this.productService.getStatusProduct(id, user);
  }

  @Get('/:slug/')
  @UseGuards(UserOptionalGuard)
  @ApiBearerAuth('access-token')
  @ApiItemResponse(ProductResponse)
  async getProduct(@Res() res: Response, @Param('slug') slug: string, @Req() req: RequestUserWithAuth) {
    const user = req.user;
    let { session_id } = req.cookies;
    if (!session_id) {
      const headers: any = res.getHeaders();
      const cookies: any = headers['set-cookie'];
      const cookie = cookies.split(';');
      const [, session_id_value] = cookie[0].split('session_id=');
      session_id = session_id_value;
    }
    const product = await this.productService.getProduct(slug, session_id, user);
    return res.json({ success: true, data: product });
  }
}
