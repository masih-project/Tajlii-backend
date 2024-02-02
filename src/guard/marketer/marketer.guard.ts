import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { MARKETER_TOKEN_STRATEGY } from './marketer-token-strategy';
import { IS_PUBLIC_KEY } from '@$/common/decorators/is-public.decorator';

@Injectable()
export class AdminGuard extends AuthGuard(MARKETER_TOKEN_STRATEGY) {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const hasValidToken = await super.canActivate(context);
    if (!hasValidToken) return false;
    return true;
  }
}
