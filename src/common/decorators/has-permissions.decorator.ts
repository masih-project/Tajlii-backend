import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '@$/modules/role/types';

export const HAS_PERMISSIONS_KEY = 'HasPermissions';
export const HasPermissions = (...permissions: PermissionType[]) => SetMetadata(HAS_PERMISSIONS_KEY, permissions);
