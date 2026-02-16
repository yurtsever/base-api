import { OAuthAccount } from '../../../domain/models/oauth-account.model';
import { OAuthAccountEntity } from '../entities/oauth-account.entity';

export class OAuthAccountMapper {
  static toDomain(entity: OAuthAccountEntity): OAuthAccount {
    return new OAuthAccount(
      entity.id,
      entity.userId,
      entity.provider,
      entity.providerUserId,
      entity.email,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: OAuthAccount): OAuthAccountEntity {
    const entity = new OAuthAccountEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.provider = domain.provider;
    entity.providerUserId = domain.providerUserId;
    entity.email = domain.email;
    return entity;
  }
}
