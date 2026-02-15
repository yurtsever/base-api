import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BusinessException extends BaseException {
  constructor(
    message: string,
    errorCode: string = 'BUSINESS_ERROR',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: unknown,
  ) {
    super(errorCode, message, statusCode, details);
  }
}
