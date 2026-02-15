import { RefreshToken } from '../../../domain/models/refresh-token.model';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export class RefreshTokenMapper {
  static toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken(
      entity.id,
      entity.token,
      entity.userId,
      entity.expiresAt,
      entity.isRevoked,
      entity.createdAt,
    );
  }

  static toEntity(domain: RefreshToken): RefreshTokenEntity {
    const entity = new RefreshTokenEntity();
    entity.id = domain.id;
    entity.token = domain.token;
    entity.userId = domain.userId;
    entity.expiresAt = domain.expiresAt;
    entity.isRevoked = domain.isRevoked();
    return entity;
  }
}
