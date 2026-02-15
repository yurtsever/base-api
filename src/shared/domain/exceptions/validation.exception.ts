import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ValidationException extends BaseException {
  constructor(message: string, details?: unknown, errorCode: string = 'VALIDATION_ERROR') {
    super(errorCode, message, HttpStatus.BAD_REQUEST, details);
  }
}
