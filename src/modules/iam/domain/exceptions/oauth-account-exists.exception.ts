import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

/**
 * Raised when an OAuth sign-in resolves to an email that already belongs to a
 * local account that has not been linked to this provider.
 *
 * We refuse to silently adopt the account: an email match is not proof of ownership.
 * The user must authenticate to the existing account (password or OTP) and link the
 * provider from an authenticated session.
 */
export class OAuthAccountExistsException extends BaseException {
  constructor(
    message: string = 'An account with this email already exists. Please sign in with your existing credentials and link this provider from your account settings.',
  ) {
    super('OAUTH_ACCOUNT_EXISTS', message, HttpStatus.CONFLICT);
  }
}
