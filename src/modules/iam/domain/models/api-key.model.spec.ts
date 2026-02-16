import { ApiKey } from './api-key.model';

describe('ApiKey', () => {
  const createApiKey = (overrides: Partial<Record<number, unknown>> = {}): ApiKey => {
    return new ApiKey(
      (overrides[0] as string) ?? 'key-id',
      (overrides[1] as string) ?? 'user-id',
      (overrides[2] as string) ?? 'My API Key',
      (overrides[3] as string) ?? 'abc123hash',
      (overrides[4] as string) ?? 'bak_a1b2c3d4',
      (overrides[5] as string[]) ?? ['users:read', 'audit:read'],
      overrides[6] !== undefined ? (overrides[6] as Date | null) : null,
      overrides[7] !== undefined ? (overrides[7] as Date | null) : null,
      overrides[8] !== undefined ? (overrides[8] as boolean) : false,
      (overrides[9] as Date) ?? new Date('2026-01-01'),
      (overrides[10] as Date) ?? new Date('2026-01-01'),
    );
  };

  it('should create an API key with correct properties', () => {
    const apiKey = createApiKey();
    expect(apiKey.id).toBe('key-id');
    expect(apiKey.userId).toBe('user-id');
    expect(apiKey.name).toBe('My API Key');
    expect(apiKey.keyHash).toBe('abc123hash');
    expect(apiKey.keyPrefix).toBe('bak_a1b2c3d4');
    expect(apiKey.scopes).toEqual(['users:read', 'audit:read']);
    expect(apiKey.expiresAt).toBeNull();
    expect(apiKey.lastUsedAt).toBeNull();
    expect(apiKey.isRevoked).toBe(false);
  });

  describe('isExpired', () => {
    it('should return false when no expiration', () => {
      const apiKey = createApiKey();
      expect(apiKey.isExpired()).toBe(false);
    });

    it('should return false when not expired', () => {
      const future = new Date(Date.now() + 86400000);
      const apiKey = createApiKey({ 6: future });
      expect(apiKey.isExpired()).toBe(false);
    });

    it('should return true when expired', () => {
      const past = new Date(Date.now() - 86400000);
      const apiKey = createApiKey({ 6: past });
      expect(apiKey.isExpired()).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should return true when not revoked and not expired', () => {
      const apiKey = createApiKey();
      expect(apiKey.isValid()).toBe(true);
    });

    it('should return false when revoked', () => {
      const apiKey = createApiKey({ 8: true });
      expect(apiKey.isValid()).toBe(false);
    });

    it('should return false when expired', () => {
      const past = new Date(Date.now() - 86400000);
      const apiKey = createApiKey({ 6: past });
      expect(apiKey.isValid()).toBe(false);
    });
  });

  describe('revoke', () => {
    it('should set isRevoked to true', () => {
      const apiKey = createApiKey();
      expect(apiKey.isRevoked).toBe(false);
      apiKey.revoke();
      expect(apiKey.isRevoked).toBe(true);
    });
  });

  describe('updateLastUsed', () => {
    it('should set lastUsedAt to current time', () => {
      const apiKey = createApiKey();
      expect(apiKey.lastUsedAt).toBeNull();
      apiKey.updateLastUsed();
      expect(apiKey.lastUsedAt).toBeInstanceOf(Date);
    });
  });

  describe('hasScope', () => {
    it('should return true for existing scope', () => {
      const apiKey = createApiKey();
      expect(apiKey.hasScope('users:read')).toBe(true);
    });

    it('should return false for non-existing scope', () => {
      const apiKey = createApiKey();
      expect(apiKey.hasScope('users:delete')).toBe(false);
    });
  });

  describe('scopes', () => {
    it('should return a copy of scopes array', () => {
      const apiKey = createApiKey();
      const scopes = apiKey.scopes;
      scopes.push('extra');
      expect(apiKey.scopes).toEqual(['users:read', 'audit:read']);
    });
  });

  describe('toJSON', () => {
    it('should return serializable object', () => {
      const apiKey = createApiKey();
      const json = apiKey.toJSON();
      expect(json.id).toBe('key-id');
      expect(json.userId).toBe('user-id');
      expect(json.name).toBe('My API Key');
      expect(json.keyPrefix).toBe('bak_a1b2c3d4');
      expect(json.scopes).toEqual(['users:read', 'audit:read']);
      expect(json.expiresAt).toBeNull();
      expect(json.lastUsedAt).toBeNull();
      expect(json.isRevoked).toBe(false);
    });
  });
});
