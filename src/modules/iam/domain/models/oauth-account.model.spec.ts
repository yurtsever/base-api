import { OAuthAccount } from './oauth-account.model';

describe('OAuthAccount', () => {
  const now = new Date();

  it('should create an OAuthAccount with all properties', () => {
    const account = new OAuthAccount('acc-1', 'user-1', 'google', 'goog-123', 'test@example.com', now, now);

    expect(account.id).toBe('acc-1');
    expect(account.userId).toBe('user-1');
    expect(account.provider).toBe('google');
    expect(account.providerUserId).toBe('goog-123');
    expect(account.email).toBe('test@example.com');
    expect(account.createdAt).toBe(now);
    expect(account.updatedAt).toBe(now);
  });

  it('should allow optional timestamps', () => {
    const account = new OAuthAccount('acc-1', 'user-1', 'github', 'gh-456', 'user@example.com');

    expect(account.createdAt).toBeUndefined();
    expect(account.updatedAt).toBeUndefined();
  });

  describe('equality', () => {
    it('should be equal when IDs match', () => {
      const a = new OAuthAccount('acc-1', 'user-1', 'google', 'goog-123', 'test@example.com');
      const b = new OAuthAccount('acc-1', 'user-2', 'github', 'gh-456', 'other@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal when IDs differ', () => {
      const a = new OAuthAccount('acc-1', 'user-1', 'google', 'goog-123', 'test@example.com');
      const b = new OAuthAccount('acc-2', 'user-1', 'google', 'goog-123', 'test@example.com');
      expect(a.equals(b)).toBe(false);
    });
  });
});
