import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { BaseException } from '../../../domain/exceptions/base.exception';
import { ErrorResponse } from '../../../application/interfaces/error-response.interface';

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isDevelopment = process.env.NODE_ENV !== 'production';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: unknown = undefined;

    // Handle different exception types
    if (exception instanceof BaseException) {
      statusCode = exception.statusCode;
      errorCode = exception.errorCode;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          (responseObj.message as string) ||
          (Array.isArray(responseObj.message) ? (responseObj.message as string[]).join(', ') : message);
        errorCode = (responseObj.error as string) || HttpStatus[statusCode] || 'HTTP_EXCEPTION';
        details = responseObj.details;
      } else {
        message = exceptionResponse.toString();
      }
    } else {
      // Unknown error
      message = isDevelopment ? exception.message : 'Internal server error';
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorCode,
      message,
      requestId: (request as unknown as { id: string }).id || (request.headers['x-request-id'] as string),
    } satisfies ErrorResponse;

    // Add details only in development or for known exceptions
    if (isDevelopment || exception instanceof BaseException) {
      errorResponse.details = details || (isDevelopment ? exception.stack : undefined);
    }

    // Log the exception
    this.logger.error(
      {
        err: exception,
        req: request,
        res: response,
        errorResponse,
      },
      `Exception caught: ${message}`,
    );

    response.status(statusCode).json(errorResponse);
  }
}
