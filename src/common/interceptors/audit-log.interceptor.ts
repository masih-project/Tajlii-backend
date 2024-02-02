import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from '@$/modules/audit/audit.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    // const useAuditLogger = this.reflector.get<string>(USE_AUDIT_LOGGER, context.getHandler());

    return next.handle().pipe(
      tap((res) => {
        const req = context.switchToHttp().getRequest();
        this.auditService.writeLog({ req: req.body, res });
      }),
    );
  }
}

// tap((res) =>
// (async () => {
// })()
//   .then(() => {
//     //
//   })
//   .catch((err) => console.err(err)),
// ),
