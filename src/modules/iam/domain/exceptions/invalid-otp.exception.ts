import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class InvalidOtpException extends BaseException {
  constructor(message: string = 'Invalid or expired OTP') {
    super('INVALID_OTP', message, HttpStatus.UNAUTHORIZED);
  }
}
