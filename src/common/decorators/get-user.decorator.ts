import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAuth } from '@$/types/authorization.types';

export const GetUser = createParamDecorator((_data, ctx: ExecutionContext): UserAuth => {
  return ctx.switchToHttp().getRequest().user;
});
