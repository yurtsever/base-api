import { Entity } from '../../../../shared/domain/base/entity';

export class Permission extends Entity<string> {
  constructor(
    id: string,
    private readonly _resource: string,
    private readonly _action: string,
    private readonly _description: string,
  ) {
    super(id);
  }

  get resource(): string {
    return this._resource;
  }

  get action(): string {
    return this._action;
  }

  get description(): string {
    return this._description;
  }

  get slug(): string {
    return `${this._resource}:${this._action}`;
  }

  toJSON() {
    return {
      id: this.id,
      resource: this._resource,
      action: this._action,
      description: this._description,
      slug: this.slug,
    };
  }
}
