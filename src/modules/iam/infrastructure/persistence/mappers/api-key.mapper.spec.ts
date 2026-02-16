import { ApiKey } from '../../../domain/models/api-key.model';
import { ApiKeyEntity } from '../entities/api-key.entity';
import { ApiKeyMapper } from './api-key.mapper';

describe('ApiKeyMapper', () => {
  const now = new Date();
  const expiresAt = new Date(Date.now() + 86400000);

  describe('toDomain', () => {
    it('should map entity to domain model', () => {
      const entity = new ApiKeyEntity();
      entity.id = 'key-id';
      entity.userId = 'user-id';
      entity.name = 'CI Key';
      entity.keyHash = 'hash123';
      entity.keyPrefix = 'bak_a1b2c3d4';
      entity.scopes = JSON.stringify(['users:read', 'audit:read']);
      entity.expiresAt = expiresAt;
      entity.lastUsedAt = now;
      entity.isRevoked = false;
      entity.createdAt = now;
      entity.updatedAt = now;

      const domain = ApiKeyMapper.toDomain(entity);

      expect(domain).toBeInstanceOf(ApiKey);
      expect(domain.id).toBe('key-id');
      expect(domain.userId).toBe('user-id');
      expect(domain.name).toBe('CI Key');
      expect(domain.keyHash).toBe('hash123');
      expect(domain.keyPrefix).toBe('bak_a1b2c3d4');
      expect(domain.scopes).toEqual(['users:read', 'audit:read']);
      expect(domain.expiresAt).toBe(expiresAt);
      expect(domain.lastUsedAt).toBe(now);
      expect(domain.isRevoked).toBe(false);
    });

    it('should handle null optional fields', () => {
      const entity = new ApiKeyEntity();
      entity.id = 'key-id';
      entity.userId = 'user-id';
      entity.name = 'CI Key';
      entity.keyHash = 'hash123';
      entity.keyPrefix = 'bak_a1b2c3d4';
      entity.scopes = JSON.stringify([]);
      entity.expiresAt = null;
      entity.lastUsedAt = null;
      entity.isRevoked = false;
      entity.createdAt = now;
      entity.updatedAt = now;

      const domain = ApiKeyMapper.toDomain(entity);

      expect(domain.expiresAt).toBeNull();
      expect(domain.lastUsedAt).toBeNull();
    });
  });

  describe('toEntity', () => {
    it('should map domain model to entity', () => {
      const domain = new ApiKey(
        'key-id',
        'user-id',
        'CI Key',
        'hash123',
        'bak_a1b2c3d4',
        ['users:read'],
        expiresAt,
        now,
        false,
        now,
        now,
      );

      const entity = ApiKeyMapper.toEntity(domain);

      expect(entity).toBeInstanceOf(ApiKeyEntity);
      expect(entity.id).toBe('key-id');
      expect(entity.userId).toBe('user-id');
      expect(entity.name).toBe('CI Key');
      expect(entity.keyHash).toBe('hash123');
      expect(entity.keyPrefix).toBe('bak_a1b2c3d4');
      expect(entity.scopes).toBe(JSON.stringify(['users:read']));
      expect(entity.expiresAt).toBe(expiresAt);
      expect(entity.lastUsedAt).toBe(now);
      expect(entity.isRevoked).toBe(false);
    });
  });
});
