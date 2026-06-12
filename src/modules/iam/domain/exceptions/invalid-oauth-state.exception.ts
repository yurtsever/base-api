import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

/**
 * Raised when an OAuth callback presents a missing, unknown, expired, or mismatched
 * `state` value. This is the CSRF defense for the authorization-code flow: the state
 * must match one this server issued for the same provider and has not yet consumed.
 */
export class InvalidOAuthStateException extends BaseException {
  constructor(message: string = 'Invalid or expired OAuth state') {
    super('INVALID_OAUTH_STATE', message, HttpStatus.UNAUTHORIZED);
  }
}
