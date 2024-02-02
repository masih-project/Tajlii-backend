import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/is-public.decorator';
import { IAdminTokenPayload } from '../types/admin-token-payload.interface';
import { AdminService } from '../services/admin.service';
import { ADMIN_ACCESS_TOKEN_STRATEGY } from './access-token.strategy';
import { HAS_PERMISSIONS_KEY } from 'src/common/decorators/has-permissions.decorator';
import { PermissionType } from '@$/modules/role/types';

@Injectable()
export class AdminGuard extends AuthGuard(ADMIN_ACCESS_TOKEN_STRATEGY) {
  constructor(
    private reflector: Reflector,
    private readonly adminService: AdminService,
  ) {
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

    const req = context.switchToHttp().getRequest();
    const token: IAdminTokenPayload = req.user;
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionType[]>(HAS_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const admin = await this.adminService.getAdminAndVerifyAccess(token.sub, requiredPermissions ?? []);
    req.admin = admin;
    return true;
  }
}
