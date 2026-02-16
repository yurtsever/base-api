import { Entity } from '../../../../shared/domain/base/entity';

export class OAuthAccount extends Entity<string> {
  constructor(
    id: string,
    private readonly _userId: string,
    private readonly _provider: string,
    private readonly _providerUserId: string,
    private readonly _email: string,
    private readonly _createdAt?: Date,
    private readonly _updatedAt?: Date,
  ) {
    super(id);
  }

  get userId(): string {
    return this._userId;
  }

  get provider(): string {
    return this._provider;
  }

  get providerUserId(): string {
    return this._providerUserId;
  }

  get email(): string {
    return this._email;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
}
