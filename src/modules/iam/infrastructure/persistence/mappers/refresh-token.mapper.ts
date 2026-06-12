import { RefreshToken } from '../../../domain/models/refresh-token.model';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export class RefreshTokenMapper {
  /**
   * Reconstructs the domain model from persistence. Only the token *hash* is stored,
   * so the model's `token` field carries the hash on read (the raw value is never persisted).
   */
  static toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken(
      entity.id,
      entity.tokenHash,
      entity.userId,
      entity.familyId,
      entity.expiresAt,
      entity.isRevoked,
      entity.createdAt,
    );
  }

  /**
   * Builds the persistence entity. The adapter supplies the SHA-256 `tokenHash`
   * (the raw token is never written to the database).
   */
  static toEntity(domain: RefreshToken, tokenHash: string): RefreshTokenEntity {
    const entity = new RefreshTokenEntity();
    entity.id = domain.id;
    entity.tokenHash = tokenHash;
    entity.familyId = domain.familyId;
    entity.userId = domain.userId;
    entity.expiresAt = domain.expiresAt;
    entity.isRevoked = domain.isRevoked();
    return entity;
  }
}
