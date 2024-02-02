import { Injectable } from '@nestjs/common';
import { BrandDocument } from 'src/modules/brand/brand.schema';
import { AdminAuth } from 'src/types/authorization.types';

@Injectable()
export class BrandLogger {
  createBrand(brand: BrandDocument, admin: string) {
    const template = `
        <div>
              برند با شناسه
              ${brand._id}
              توسط
            ${admin}
            ایجاد شد
        </div>
        `;
    return template;
  }
  updateBrand(brand: BrandDocument, admin: string) {
    const template = `
        <div>
              برند با شناسه
              ${brand._id}
              توسط
            ${admin}
            آپدیت شد
        </div>
        `;
    return template;
  }
  deleteBrand(brand: BrandDocument, admin: string) {
    const template = `
        <div>
              برند با شناسه
              ${brand._id}
              توسط
            ${admin}
            حذف شد
        </div>
        `;
    return template;
  }
}
