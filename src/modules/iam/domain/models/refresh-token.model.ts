import { Entity } from '../../../../shared/domain/base/entity';

export class RefreshToken extends Entity<string> {
  constructor(
    id: string,
    private readonly _token: string,
    private readonly _userId: string,
    private readonly _expiresAt: Date,
    private _isRevoked: boolean,
    private readonly _createdAt?: Date,
  ) {
    super(id);
  }

  get token(): string {
    return this._token;
  }

  get userId(): string {
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

  isRevoked(): boolean {
    return this._isRevoked;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  revoke(): void {
    this._isRevoked = true;
  }
}
