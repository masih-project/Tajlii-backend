import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAdminTokenPayload } from '@$/modules/admin/types/admin-token-payload.interface';
import { AdminDocument } from '@$/modules/admin/schemas/admin.schema';

export const GetAdmin = createParamDecorator((_data, ctx: ExecutionContext): IAdminTokenPayload | AdminDocument => {
  return ctx.switchToHttp().getRequest().admin;
});
