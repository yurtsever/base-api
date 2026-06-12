import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

/**
 * Raised when linking an OAuth provider identity that is already linked to an account.
 * The message is intentionally generic so it does not reveal whether the identity
 * belongs to the current user or someone else.
 */
export class OAuthAccountAlreadyLinkedException extends BaseException {
  constructor(message: string = 'This provider account is already linked to an account') {
    super('OAUTH_ACCOUNT_ALREADY_LINKED', message, HttpStatus.CONFLICT);
  }
}
