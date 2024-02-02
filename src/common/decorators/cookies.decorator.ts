import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookies = createParamDecorator((name: string, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();
  return name ? request.cookies?.[name] : request.cookies;
});

export const SignedCookies = createParamDecorator((name: string, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();
  return name ? request.signedCookies?.[name] : request.signedCookies;
});
