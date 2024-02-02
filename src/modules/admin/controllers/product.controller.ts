import { Body, Controller, Delete, Get, Param, Post, Patch, Query, UseGuards, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { ProductService } from '@$/modules/product/services/product.service';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { CreateProductDto } from '@$/modules/product/dto/createProduct.dto';
import { GetAdmin } from '@$/common/decorators/get-admin.decorator';
import { Admin } from '../schemas/admin.schema';
import { ApiPaginateResponse } from '@$/common/decorators/api-paginate-response.decorator';
import { ProductResponse } from '@$/modules/product/dto/product.dto';
import { QueryProductByAdmin } from '@$/modules/product/dto/queryProductByAdmin.dto';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UpdateProductByAdmin } from '@$/modules/product/dto/updateProduct.dto';
import { Response } from 'express';
import * as excel from 'exceljs';
import { ProductDocument } from '@$/modules/product/schemas/product.schema';
import { PublicUtils } from '@$/utils/public-utils';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/product')
@Controller('admin/product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly publicUtils: PublicUtils,
  ) {}

  @Get('/excel')
  @HasPermissions('Report.Product')
  async exportExcelProduct(@Res() res: Response) {
    const items: ProductDocument[] = await this.productService.genrateExcelProducts();
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Products');
    worksheet.columns = [
      { header: 'شناسه محصول', key: 'product_code', width: 18 },
      { header: 'نام محصول', key: 'title_fa', width: 18 },
      { header: 'کد محصول', key: 'product_id', width: 18 },
      { header: 'برند', key: 'brand', width: 18 },
      { header: 'دسته بندی', key: 'category', width: 18 },
      { header: 'وضعیت', key: 'status', width: 18 },
      { header: 'موجودی', key: 'inventory', width: 18 },
      { header: 'قیمت نهایی', key: 'price_after_discount', width: 18 },
      { header: 'امتیاز', key: 'score', width: 18 },
    ];
    const products = items.map((item: ProductDocument) => {
      return {
        product_code: item.product_code,
        score: item.score,
        title_fa: item.title_fa,
        product_id: item.product_id,
        category: (item.category as any).name,
        brand: (item.brand as any).name,
        inventory: item.inventory || '',
        price_after_discount: item.price_after_discount,
        status: this.publicUtils.getLabelStatusProduct(item.status),
      };
    });

    worksheet.addRows(products);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'products.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  }

  @Post('/')
  @HasPermissions('Create.Product')
  async createProductByAdmin(@GetAdmin() admin: Admin, @Body() body: CreateProductDto) {
    return this.productService.createProductByAdmin(body);
  }

  @Get('/')
  @HasPermissions('Read.Product')
  @ApiPaginateResponse(ProductResponse)
  async getProductsByAdmin(@Query() query: QueryProductByAdmin) {
    return this.productService.getProductsByAdmin(query);
  }

  @Get('/:id')
  @HasPermissions('Read.Product')
  @ApiOkResponse({ type: ProductResponse })
  async getProductByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productService.getProductByAdmin(id);
  }

  @Patch('/:id')
  @HasPermissions('Update.Product')
  async updateProductByAdmin(
    @GetAdmin() admin: Admin,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: UpdateProductByAdmin,
  ) {
    return this.productService.updateProductByAdmin(id, body);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Product')
  async deleteProductByAdmin(@GetAdmin() admin: Admin, @Param('id', ParseObjectIdPipe) id: string) {
    return this.productService.deleteProductByAdmin(id);
  }
}
