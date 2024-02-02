import { Injectable } from '@nestjs/common';
import { DepotDocument } from 'src/modules/Depot/depot.schema';
import { AdminAuth } from 'src/types/authorization.types';

@Injectable()
export class DepotLogger {
  createDepot(depot: DepotDocument, admin: string) {
    const template = `
        <div>
              انبارداری با شناسه
              ${depot._id}
              توسط
            ${admin}
            ایجاد شد
        </div>
        `;
    return template;
  }
  updateDepot(depot: DepotDocument, admin: string) {
    const template = `
        <div>
              انبارداری با شناسه
              ${depot._id}
              توسط
            ${admin}
            آپدیت شد
        </div>
        `;
    return template;
  }
  deleteDepot(depot: DepotDocument, admin: string) {
    const template = `
        <div>
              انبارداری با شناسه
              ${depot._id}
              توسط
            ${admin}
            حذف شد
        </div>
        `;
    return template;
  }
  deleteProductByAdmin(id: string, admin: string) {
    const template = `
        <div>
              محصول با شناسه
              ${id}
              توسط
            ${admin}
            حذف شد
        </div>
        `;
    return template;
  }
}
