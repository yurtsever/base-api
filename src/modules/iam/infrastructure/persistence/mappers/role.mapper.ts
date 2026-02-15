import { Role } from '../../../domain/models/role.model';
import { RoleEntity } from '../entities/role.entity';
import { PermissionMapper } from './permission.mapper';

export class RoleMapper {
  static toDomain(entity: RoleEntity): Role {
    const permissions = (entity.permissions || []).map((p) => PermissionMapper.toDomain(p));
    return new Role(entity.id, entity.name, entity.description, entity.isDefault, permissions);
  }

  static toEntity(domain: Role): RoleEntity {
    const entity = new RoleEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.isDefault = domain.isDefault;
    entity.permissions = domain.permissions.map((p) => PermissionMapper.toEntity(p));
    return entity;
  }
}
