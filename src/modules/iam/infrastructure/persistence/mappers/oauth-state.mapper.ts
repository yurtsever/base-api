import { OAuthState } from '../../../domain/models/oauth-state.model';
import { OAuthStateEntity } from '../entities/oauth-state.entity';

export class OAuthStateMapper {
  static toDomain(entity: OAuthStateEntity): OAuthState {
    return new OAuthState(entity.id, entity.state, entity.provider, entity.expiresAt, entity.createdAt);
  }

  static toEntity(domain: OAuthState): OAuthStateEntity {
    const entity = new OAuthStateEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.state = domain.state;
    entity.provider = domain.provider;
    entity.expiresAt = domain.expiresAt;
    return entity;
  }
}
