import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class TokenExpiredException extends BaseException {
  constructor(message: string = 'Token has expired') {
    super('TOKEN_EXPIRED', message, HttpStatus.UNAUTHORIZED);
  }
}
