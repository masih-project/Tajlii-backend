import { SetMetadata } from '@nestjs/common';

export const USE_AUDIT_LOGGER = 'UseAuditLogger';
export const UseAuditLogger = () => SetMetadata(USE_AUDIT_LOGGER, true);
