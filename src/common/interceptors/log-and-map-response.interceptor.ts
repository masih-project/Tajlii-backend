import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';
import { getClientIp } from '@supercharge/request-ip';
import { CookieOptions, Request, Response } from 'express';
import { AdminDocument } from '@$/modules/admin/schemas/admin.schema';
import { Reflector } from '@nestjs/core';
import { RabbitPublisherService } from '@$/modules/rabbitmq/rabbit-publisher.service';
import { AUDIT_LOG } from '../decorators/audit-log.decorator';
import { ServerResponse } from 'http';
import { IGNORE_RESPONSE_INTERCEPTOR } from '../decorators/ignore-response-interceptor.decorator';

export class Cookie {
  constructor(
    public name: string,
    public data: any,
    public options?: CookieOptions,
  ) {}
}
export class ResponseWithCookie {
  constructor(
    public data: any,
    public cookie: Cookie,
  ) {}
}

@Injectable()
export class LogAndMapResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly rabbitService: RabbitPublisherService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const ignoreResponseInterceptor = this.reflector.get(IGNORE_RESPONSE_INTERCEPTOR, context.getHandler());
    if (ignoreResponseInterceptor) return next.handle();

    // const req: Request & { admin?: AdminDocument; user?: any } = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    // const auditLog = this.reflector.get(AUDIT_LOG, context.getHandler());

    return next.handle().pipe(
      // tap({
      //   next: (data: any) => {
      //     this.rabbitService.logApiCall({
      //       date: Date.now(),
      //       ip: getClientIp(req),
      //       adminId: req.admin?._id.toString(),
      //       userId: req.user?._id,
      //       method: req.method,
      //       url: req.url,
      //       success: true,
      //       status: res.statusCode,
      //       req: { body: req.body, params: req.params, query: req.query },
      //       res: data instanceof ServerResponse || data?.data instanceof ServerResponse ? {} : data,
      //     });
      //     if (auditLog)
      //       this.rabbitService.auditLog({
      //         model: auditLog.model,
      //         action: auditLog.action,
      //         date: Date.now(),
      //         adminId: req.admin?._id.toString(),
      //         userId: req.user?._id,
      //         doc: data,
      //         docId: data?._id?.toString(),
      //       });
      //   },
      //   error: (err) => {
      //     this.rabbitService.logApiCall({
      //       date: Date.now(),
      //       ip: getClientIp(req),
      //       adminId: req.admin?._id.toString(),
      //       userId: req.user?._id,
      //       method: req.method,
      //       url: req.url,
      //       success: false,
      //       status: err?.response?.statusCode ?? err.status ?? res.statusCode,
      //       req: { body: req.body, params: req.params, query: req.query },
      //       err: err.message,
      //     });
      //   },
      // }),
      map((response) => {
        if (response instanceof ResponseWithCookie) {
          res.cookie(response.cookie.name, response.cookie.data, response.cookie.options);
          response = response.data;
        }
        return { success: true, data: response };
      }),
    );
  }
}

// audit log => (in delete,create,update) doc,docId,action,value,userId/adminId,date
// user-activity => (manually) front must send data to api
// api calls => (in all requests) ip and userId/adminId method route status success req res date
// vezarat => (in delete,create,update, almost all requests) filter data and add exId=_id

// return next.handle().pipe(
//   tap((res) => {
//   }),
//   catchError((err) => {
//     return throwError(() => err);
//   }),
// );

//###########################  Request lifecycle ##########################
//1 Middleware
//2 Guards  => I.Global guards  II.Controller guards   III.Route guards
//3 Interceptor => I.Global  II.Controller   III.Route
//4 Pipes  => I.Global  II.Controller   III.Route   IV.Route Param
//5 Controller
//6 Service
//7 Interceptor (outbound) => I.Route   II.Controller   III.Global
//8 Filters (if necessary) => I.Route   II.Controller   III.Global
