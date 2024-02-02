import { Injectable } from '@nestjs/common';
import { ProductDocument } from '@$/modules/product/schemas/product.schema';

@Injectable()
export class ProductLogger {
  createProductByAdmin(product: ProductDocument, admin: string) {
    const template = `
        <div>
              محصول با شناسه
              ${product._id}
              توسط
            ${admin}
            ایجاد شد
        </div>
        `;
    return template;
  }
  deleteProductByAdmin(product: ProductDocument, admin: string) {
    const template = `
        <div>
              محصول با شناسه
              ${product._id}
              توسط
            ${admin}
            حذف شد
        </div>
        `;
    return template;
  }
  updateProductByAdmin(product: ProductDocument, admin: string) {
    const template = `
        <div>
              محصول با شناسه
              ${product._id}
              توسط
            ${admin}
            آپدیت شد
        </div>
        `;
    return template;
  }
}
