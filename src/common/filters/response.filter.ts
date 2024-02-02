import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class ResponseExceptionFilter<T extends HttpException> implements ExceptionFilter {
  public catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const errRes: any = exception.getResponse();
    response.status(exception.getStatus()).json({
      success: false,
      message: typeof errRes === 'string' ? errRes : errRes.message,
    });
  }
}
