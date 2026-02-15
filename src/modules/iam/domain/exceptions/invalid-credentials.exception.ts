import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class InvalidCredentialsException extends BaseException {
  constructor(message: string = 'Invalid email or password') {
    super('INVALID_CREDENTIALS', message, HttpStatus.UNAUTHORIZED);
  }
}
