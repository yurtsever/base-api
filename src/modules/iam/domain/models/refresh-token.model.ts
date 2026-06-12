import { Entity } from '../../../../shared/domain/base/entity';

export class RefreshToken extends Entity<string> {
  constructor(
    id: string,
    private readonly _token: string,
    private readonly _userId: string,
    private readonly _familyId: string,
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

  /**
   * Identifies the rotation lineage this token belongs to. A login starts a new
   * family; each rotation inherits it. Reuse of a revoked token revokes the whole family.
   */
  get familyId(): string {
    return this._familyId;
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
