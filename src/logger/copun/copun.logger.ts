import { Injectable } from '@nestjs/common';
import { copunDocument } from 'src/modules/copun/copun.schema';
import { DepotDocument } from 'src/modules/Depot/depot.schema';
import { AdminAuth } from 'src/types/authorization.types';

@Injectable()
export class CopunLogger {
  createCopunByAdmin(copun: copunDocument, admin: string) {
    const template = `
        <div>
              کدتخفیف  با شناسه
              ${copun._id}
              توسط
            ${admin}
            ایجاد شد
        </div>
        `;
    return template;
  }
  updateCopunByAdmin(copun: copunDocument, admin: string) {
    const template = `
        <div>
              کدتخفیف با شناسه
              ${copun._id}
              توسط
            ${admin}
            آپدیت شد
        </div>
        `;
    return template;
  }
  deleteCopunByAdmin(copun: copunDocument, admin: string) {
    const template = `
        <div>
              کدتخفیف با شناسه
              ${copun._id}
              توسط
            ${admin}
            حذف شد
        </div>
        `;
    return template;
  }
}
