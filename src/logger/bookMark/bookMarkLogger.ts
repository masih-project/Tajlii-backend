import { BookMarkDocument } from 'src/modules/bookMark/bookMark.schema';
import { UserAuth } from 'src/types/authorization.types';

export class BookMarkLogger {
  createBookMark(bookMark: BookMarkDocument, user: UserAuth) {
    const template = `
        <div>
              محصول با شناسه
              ${bookMark._id}
              توسط
            ${user.username}
            به bookMark
            اضافه شد
        </div>
        `;
    return template;
  }
  deleteBookMark(bookMark: BookMarkDocument, user: UserAuth) {
    const template = `
        <div>
            محصول با شناسه
              ${bookMark._id}
              توسط
            ${user.username}
            از bookMark
            حذف شد
        </div>
        `;
    return template;
  }
}
