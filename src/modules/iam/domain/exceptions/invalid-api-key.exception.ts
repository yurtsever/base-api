import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class InvalidApiKeyException extends BaseException {
  constructor(message: string = 'Invalid or expired API key') {
    super('INVALID_API_KEY', message, HttpStatus.UNAUTHORIZED);
  }
}
