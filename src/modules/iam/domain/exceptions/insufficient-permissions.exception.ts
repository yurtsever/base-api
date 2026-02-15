import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class InsufficientPermissionsException extends BaseException {
  constructor(message: string = 'Insufficient permissions') {
    super('INSUFFICIENT_PERMISSIONS', message, HttpStatus.FORBIDDEN);
  }
}
