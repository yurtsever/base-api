import { Entity } from '../../../../shared/domain/base/entity';

export class Otp extends Entity<string> {
  constructor(
    id: string,
    private readonly _code: string,
    private readonly _email: string,
    private readonly _expiresAt: Date,
    private _isUsed: boolean,
    private _attempts: number,
    private readonly _createdAt?: Date,
  ) {
    super(id);
  }

  get code(): string {
    return this._code;
  }

  get email(): string {
    return this._email;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get isUsed(): boolean {
    return this._isUsed;
  }

  get attempts(): number {
    return this._attempts;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired() && !this._isUsed;
  }

  use(): void {
    this._isUsed = true;
  }

  incrementAttempts(): void {
    this._attempts += 1;
  }

  hasExceededMaxAttempts(max: number): boolean {
    return this._attempts >= max;
  }
}
