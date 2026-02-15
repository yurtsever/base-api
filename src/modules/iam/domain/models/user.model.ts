import { AggregateRoot } from '../../../../shared/domain/base/aggregate-root';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';
import { Role } from './role.model';

export class User extends AggregateRoot<string> {
  constructor(
    id: string,
    private readonly _email: Email,
    private _password: Password,
    private _firstName: string,
    private _lastName: string,
    private _isActive: boolean,
    private readonly _roles: Role[],
    private readonly _createdAt?: Date,
    private readonly _updatedAt?: Date,
  ) {
    super(id);
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get roles(): Role[] {
    return [...this._roles];
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  hasRole(roleName: string): boolean {
    return this._roles.some((r) => r.name === roleName);
  }

  hasPermission(resource: string, action: string): boolean {
    return this._roles.some((r) => r.hasPermission(resource, action));
  }

  toJSON() {
    return {
      id: this.id,
      email: this._email.value,
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      isActive: this._isActive,
      roles: this._roles.map((r) => r.toJSON()),
      createdAt: this._createdAt?.toISOString(),
      updatedAt: this._updatedAt?.toISOString(),
    };
  }
}
