import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    public readonly errorCode: string,
    public readonly message: string,
    public readonly statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly details?: unknown,
  ) {
    super(
      {
        errorCode,
        message,
        details,
      },
      statusCode,
    );
  }
}
