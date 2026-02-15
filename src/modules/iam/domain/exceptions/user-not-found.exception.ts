import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class UserNotFoundException extends BaseException {
  constructor(identifier: string) {
    super('USER_NOT_FOUND', `User not found: ${identifier}`, HttpStatus.NOT_FOUND);
  }
}
