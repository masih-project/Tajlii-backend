import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG = 'AuditLog';
export const AuditLog = (model: string, action: 'DELETE' | 'UPDATE' | 'CREATE') =>
  SetMetadata(AUDIT_LOG, { model, action });
