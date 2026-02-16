import { OAuthAccountMapper } from './oauth-account.mapper';
import { OAuthAccount } from '../../../domain/models/oauth-account.model';
import { OAuthAccountEntity } from '../entities/oauth-account.entity';

describe('OAuthAccountMapper', () => {
  const now = new Date();

  describe('toDomain', () => {
    it('should map entity to domain model', () => {
      const entity = new OAuthAccountEntity();
      entity.id = 'acc-1';
      entity.userId = 'user-1';
      entity.provider = 'google';
      entity.providerUserId = 'goog-123';
      entity.email = 'test@example.com';
      entity.createdAt = now;
      entity.updatedAt = now;

      const domain = OAuthAccountMapper.toDomain(entity);

      expect(domain).toBeInstanceOf(OAuthAccount);
      expect(domain.id).toBe('acc-1');
      expect(domain.userId).toBe('user-1');
      expect(domain.provider).toBe('google');
      expect(domain.providerUserId).toBe('goog-123');
      expect(domain.email).toBe('test@example.com');
      expect(domain.createdAt).toBe(now);
      expect(domain.updatedAt).toBe(now);
    });
  });

  describe('toEntity', () => {
    it('should map domain model to entity', () => {
      const domain = new OAuthAccount('acc-1', 'user-1', 'github', 'gh-456', 'user@example.com', now, now);

      const entity = OAuthAccountMapper.toEntity(domain);

      expect(entity).toBeInstanceOf(OAuthAccountEntity);
      expect(entity.id).toBe('acc-1');
      expect(entity.userId).toBe('user-1');
      expect(entity.provider).toBe('github');
      expect(entity.providerUserId).toBe('gh-456');
      expect(entity.email).toBe('user@example.com');
    });
  });

  describe('round-trip', () => {
    it('should preserve data through toDomain -> toEntity', () => {
      const original = new OAuthAccount('acc-1', 'user-1', 'google', 'goog-123', 'test@example.com', now, now);
      const entity = OAuthAccountMapper.toEntity(original);
      entity.createdAt = now;
      entity.updatedAt = now;
      const result = OAuthAccountMapper.toDomain(entity);

      expect(result.id).toBe(original.id);
      expect(result.userId).toBe(original.userId);
      expect(result.provider).toBe(original.provider);
      expect(result.providerUserId).toBe(original.providerUserId);
      expect(result.email).toBe(original.email);
    });
  });
});
