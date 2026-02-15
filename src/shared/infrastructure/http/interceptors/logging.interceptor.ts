import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = (request as unknown as { id: string }).id || request.headers.get('x-request-id');

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response: Response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;

          this.logger.info({
            requestId,
            method,
            url,
            statusCode: (response as unknown as { statusCode: number }).statusCode,
            responseTime: `${delay}ms`,
          });
        },
        error: (error) => {
          const delay = Date.now() - now;

          this.logger.error({
            requestId,
            method,
            url,
            error: (error as unknown as { message: string }).message,
            responseTime: `${delay}ms`,
          });
        },
      }),
    );
  }
}
