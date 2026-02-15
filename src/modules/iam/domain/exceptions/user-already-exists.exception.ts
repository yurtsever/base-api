import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class UserAlreadyExistsException extends BaseException {
  constructor(email: string) {
    super('USER_ALREADY_EXISTS', `User with email ${email} already exists`, HttpStatus.BAD_REQUEST);
  }
}
