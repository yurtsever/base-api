import { ApiKey } from '../../../domain/models/api-key.model';
import { ApiKeyEntity } from '../entities/api-key.entity';

export class ApiKeyMapper {
  static toDomain(entity: ApiKeyEntity): ApiKey {
    const scopes = JSON.parse(entity.scopes) as string[];

    return new ApiKey(
      entity.id,
      entity.userId,
      entity.name,
      entity.keyHash,
      entity.keyPrefix,
      scopes,
      entity.expiresAt,
      entity.lastUsedAt,
      entity.isRevoked,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: ApiKey): ApiKeyEntity {
    const entity = new ApiKeyEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.name = domain.name;
    entity.keyHash = domain.keyHash;
    entity.keyPrefix = domain.keyPrefix;
    entity.scopes = JSON.stringify(domain.scopes);
    entity.expiresAt = domain.expiresAt;
    entity.lastUsedAt = domain.lastUsedAt;
    entity.isRevoked = domain.isRevoked;
    return entity;
  }
}
