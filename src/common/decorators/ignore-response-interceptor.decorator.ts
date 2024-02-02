import { SetMetadata } from '@nestjs/common';

export const IGNORE_RESPONSE_INTERCEPTOR = 'IgnoreResponseInterceptor';
export const IgnoreResponseInterceptor = () => SetMetadata(IGNORE_RESPONSE_INTERCEPTOR, true);
