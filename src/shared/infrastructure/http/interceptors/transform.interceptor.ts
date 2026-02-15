import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '../../../application/interfaces/success-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: (response as unknown as { statusCode: number }).statusCode,
        data: data as T,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
