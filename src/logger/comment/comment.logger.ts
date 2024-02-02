import { CommentDocument } from 'src/modules/comment/comment.schema';
import { AdminAuth, UserAuth } from 'src/types/authorization.types';

export class CommentLogger {
  createComment(comment: CommentDocument, user: UserAuth) {
    const template = `
        <div>
              یک کامنت با شناسه
              ${comment._id}
              توسط
            ${user.username}
            ایجاد شد
        </div>
        `;
    return template;
  }

  deleteCommentByAdmin(comment: CommentDocument, admin: AdminAuth) {
    const template = `
        <div>
              یک کامنت با شناسه
              ${comment._id}
              توسط
            ${admin.username}
            حذف شد
        </div>
        `;
    return template;
  }
}
