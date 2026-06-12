import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

/**
 * Raised when an OAuth redirect URI is not on the configured allowlist.
 * Exact-match allowlisting (no wildcards/prefixes) is the OAuth 2.0 Security BCP
 * defense against open-redirect and authorization-code interception.
 */
export class InvalidRedirectUriException extends BaseException {
  constructor(message: string = 'The provided redirect URI is not allowed') {
    super('INVALID_REDIRECT_URI', message, HttpStatus.BAD_REQUEST);
  }
}
