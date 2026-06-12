import { Entity } from '../../../../shared/domain/base/entity';

/**
 * A single-use, short-lived CSRF token for the OAuth authorization-code flow.
 * Issued when the authorization URL is built and verified (then consumed) on callback.
 * Bound to the provider it was issued for, so a state cannot be replayed across providers.
 */
export class OAuthState extends Entity<string> {
  constructor(
    id: string,
    private readonly _state: string,
    private readonly _provider: string,
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
