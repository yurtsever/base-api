import { AggregateRoot } from '../../../../shared/domain/base/aggregate-root';

export class ApiKey extends AggregateRoot<string> {
  constructor(
    id: string,
    private readonly _userId: string,
    private readonly _name: string,
    private readonly _keyHash: string,
    private readonly _keyPrefix: string,
    private readonly _scopes: string[],
    private _expiresAt: Date | null,
    private _lastUsedAt: Date | null,
    private _isRevoked: boolean,
    private readonly _createdAt?: Date,
    private readonly _updatedAt?: Date,
  ) {
    super(id);
  }

  get userId(): string {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get keyHash(): string {
    return this._keyHash;
  }

  get keyPrefix(): string {
    return this._keyPrefix;
  }

  get scopes(): string[] {
    return [...this._scopes];
  }

  get expiresAt(): Date | null {
    return this._expiresAt;
  }

  get lastUsedAt(): Date | null {
    return this._lastUsedAt;
  }

  get isRevoked(): boolean {
    return this._isRevoked;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  isExpired(): boolean {
    if (!this._expiresAt) {
      return false;
    }
    return new Date() > this._expiresAt;
  }

  isValid(): boolean {
    return !this._isRevoked && !this.isExpired();
  }

  revoke(): void {
    this._isRevoked = true;
  }

  updateLastUsed(): void {
    this._lastUsedAt = new Date();
  }

  hasScope(scope: string): boolean {
    return this._scopes.includes(scope);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this._userId,
      name: this._name,
      keyPrefix: this._keyPrefix,
      scopes: [...this._scopes],
      expiresAt: this._expiresAt?.toISOString() ?? null,
      lastUsedAt: this._lastUsedAt?.toISOString() ?? null,
      isRevoked: this._isRevoked,
      createdAt: this._createdAt?.toISOString(),
      updatedAt: this._updatedAt?.toISOString(),
    };
  }
}
