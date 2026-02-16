import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class OAuthException extends BaseException {
  constructor(message: string = 'OAuth authentication failed') {
    super('OAUTH_ERROR', message, HttpStatus.UNAUTHORIZED);
  }
}
