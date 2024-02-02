import { AddressDocument } from 'src/modules/address/address.schema';
import { UserAuth } from 'src/types/authorization.types';

export class AddressLogger {
  createAddress(address: AddressDocument, user: UserAuth) {
    const template = `
        <div>
              آدرس با شناسه
              ${address._id}
              توسط
            ${user.username}
            ایجاد شد
        </div>
        `;
    return template;
  }
  updateAddress(address: AddressDocument, user: UserAuth) {
    const template = `
        <div>
              آدرس با شناسه
              ${address._id}
              توسط
            ${user.username}
            آپدیت شد
        </div>
        `;
    return template;
  }
  deleteAddress(address: AddressDocument, user: UserAuth) {
    const template = `
        <div>
        آدرس با شناسه
              ${address._id}
              توسط
            ${user.username}
            حذف شد
        </div>
        `;
    return template;
  }
}
