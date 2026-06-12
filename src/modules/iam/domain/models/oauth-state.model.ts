import { Entity } from '../../../../shared/domain/base/entity';

/**
 * A single-use, short-lived CSRF token for the OAuth authorization-code flow.
 * Issued when the authorization URL is built and verified (then consumed) on callback.
 * Bound to the provider it was issued for, so a state cannot be replayed across providers.
 *
 * For account *linking*, it is additionally bound to the initiating user (`userId`), so a
 * logged-in victim cannot be tricked into linking an attacker's provider identity (link-CSRF).
 * For *login*, `userId` is null.
 */
export class OAuthState extends Entity<string> {
  constructor(
    id: string,
    private readonly _state: string,
    private readonly _provider: string,
    private readonly _userId: string | null,
    private readonly _expiresAt: Date,
    private readonly _createdAt?: Date,
  ) {
    super(id);
  }

  get state(): string {
    return this._state;
  }

  get provider(): string {
    return this._provider;
  }

  get userId(): string | null {
    return this._userId;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }
}
