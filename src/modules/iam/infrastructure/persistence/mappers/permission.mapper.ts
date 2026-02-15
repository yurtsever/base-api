import { Permission } from '../../../domain/models/permission.model';
import { PermissionEntity } from '../entities/permission.entity';

export class PermissionMapper {
  static toDomain(entity: PermissionEntity): Permission {
    return new Permission(entity.id, entity.resource, entity.action, entity.description);
  }

  static toEntity(domain: Permission): PermissionEntity {
    const entity = new PermissionEntity();
    entity.id = domain.id;
    entity.resource = domain.resource;
    entity.action = domain.action;
    entity.description = domain.description;
    return entity;
  }
}
