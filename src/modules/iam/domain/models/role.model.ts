import { Entity } from '../../../../shared/domain/base/entity';
import { Permission } from './permission.model';

export class Role extends Entity<string> {
  constructor(
    id: string,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _isDefault: boolean,
    private readonly _permissions: Permission[],
  ) {
    super(id);
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  get permissions(): Permission[] {
    return [...this._permissions];
  }

  hasPermission(resource: string, action: string): boolean {
    return this._permissions.some((p) => p.resource === resource && p.action === action);
  }

  toJSON() {
    return {
      id: this.id,
      name: this._name,
      description: this._description,
      isDefault: this._isDefault,
      permissions: this._permissions.map((p) => p.toJSON()),
    };
  }
}
