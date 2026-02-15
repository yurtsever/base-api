import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class EmailSendFailedException extends BaseException {
  constructor(detail?: string) {
    super('EMAIL_SEND_FAILED', `Email delivery failed: ${detail || 'unknown error'}`, HttpStatus.BAD_GATEWAY);
  }
}
