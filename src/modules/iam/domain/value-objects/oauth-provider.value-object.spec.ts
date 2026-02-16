import { OAuthProvider } from './oauth-provider.value-object';

describe('OAuthProvider', () => {
  describe('create', () => {
    it('should create a valid Google provider', () => {
      const provider = OAuthProvider.create('google');
      expect(provider.value).toBe('google');
    });

    it('should create a valid GitHub provider', () => {
      const provider = OAuthProvider.create('github');
      expect(provider.value).toBe('github');
    });

    it('should normalize to lowercase', () => {
      const provider = OAuthProvider.create('GOOGLE');
      expect(provider.value).toBe('google');
    });

    it('should trim whitespace', () => {
      const provider = OAuthProvider.create('  github  ');
      expect(provider.value).toBe('github');
    });

    it('should throw for unsupported provider', () => {
      expect(() => OAuthProvider.create('facebook')).toThrow('Unsupported OAuth provider');
    });

    it('should throw for empty string', () => {
      expect(() => OAuthProvider.create('')).toThrow('Unsupported OAuth provider');
    });

    it('should throw for null-ish input', () => {
      expect(() => OAuthProvider.create(null as unknown as string)).toThrow();
    });
  });

  describe('equality', () => {
    it('should be equal when same provider', () => {
      const a = OAuthProvider.create('google');
      const b = OAuthProvider.create('google');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal when different provider', () => {
      const a = OAuthProvider.create('google');
      const b = OAuthProvider.create('github');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('supportedProviders', () => {
    it('should return supported providers', () => {
      expect(OAuthProvider.supportedProviders).toContain('google');
      expect(OAuthProvider.supportedProviders).toContain('github');
    });
  });
});
