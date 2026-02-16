import { Sha256ApiKeyHasherAdapter } from './sha256-api-key-hasher.adapter';

describe('Sha256ApiKeyHasherAdapter', () => {
  let hasher: Sha256ApiKeyHasherAdapter;

  beforeEach(() => {
    hasher = new Sha256ApiKeyHasherAdapter();
  });

  describe('hash', () => {
    it('should return a 64-character hex string', () => {
      const result = hasher.hash('bak_test123');
      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should return the same hash for the same input', () => {
      const hash1 = hasher.hash('bak_test123');
      const hash2 = hasher.hash('bak_test123');
      expect(hash1).toBe(hash2);
    });

    it('should return different hashes for different inputs', () => {
      const hash1 = hasher.hash('bak_test123');
      const hash2 = hasher.hash('bak_test456');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateKey', () => {
    it('should return raw key, hash, and prefix', () => {
      const result = hasher.generateKey();
      expect(result).toHaveProperty('raw');
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('prefix');
    });

    it('should start raw key with bak_ prefix', () => {
      const result = hasher.generateKey();
      expect(result.raw).toMatch(/^bak_/);
    });

    it('should have prefix as first 12 chars of raw key', () => {
      const result = hasher.generateKey();
      expect(result.prefix).toBe(result.raw.substring(0, 12));
      expect(result.prefix).toHaveLength(12);
    });

    it('should have hash that matches hashing the raw key', () => {
      const result = hasher.generateKey();
      expect(result.hash).toBe(hasher.hash(result.raw));
    });

    it('should generate unique keys', () => {
      const result1 = hasher.generateKey();
      const result2 = hasher.generateKey();
      expect(result1.raw).not.toBe(result2.raw);
      expect(result1.hash).not.toBe(result2.hash);
    });
  });
});
