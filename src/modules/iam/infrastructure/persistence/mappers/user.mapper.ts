import { User } from '../../../domain/models/user.model';
import { Email } from '../../../domain/value-objects/email.value-object';
import { Password } from '../../../domain/value-objects/password.value-object';
import { UserEntity } from '../entities/user.entity';
import { RoleMapper } from './role.mapper';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    const email = Email.create(entity.email);
    const password = Password.createFromHash(entity.password);
    const roles = (entity.roles || []).map((r) => RoleMapper.toDomain(r));

    return new User(
      entity.id,
      email,
      password,
      entity.firstName,
      entity.lastName,
      entity.isActive,
      roles,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email.value;
    entity.password = domain.password.value;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.isActive = domain.isActive;
    entity.roles = domain.roles.map((r) => RoleMapper.toEntity(r));
    return entity;
  }
}
