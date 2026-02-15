import { RefreshToken } from './refresh-token.model';

describe('RefreshToken Model', () => {
  it('should detect expired token', () => {
    const token = new RefreshToken(
      'token-id',
      'token-value',
      'user-id',
      new Date(Date.now() - 1000), // expired 1 second ago
      false,
    );
    expect(token.isExpired()).toBe(true);
    expect(token.isValid()).toBe(false);
  });

  it('should detect valid token', () => {
    const token = new RefreshToken(
      'token-id',
      'token-value',
      'user-id',
      new Date(Date.now() + 60000), // expires in 60 seconds
      false,
    );
    expect(token.isExpired()).toBe(false);
    expect(token.isRevoked()).toBe(false);
    expect(token.isValid()).toBe(true);
  });

  it('should detect revoked token', () => {
    const token = new RefreshToken(
      'token-id',
      'token-value',
      'user-id',
      new Date(Date.now() + 60000),
      true, // revoked
    );
    expect(token.isRevoked()).toBe(true);
    expect(token.isValid()).toBe(false);
  });

  it('should revoke token', () => {
    const token = new RefreshToken('token-id', 'token-value', 'user-id', new Date(Date.now() + 60000), false);
    expect(token.isValid()).toBe(true);
    token.revoke();
    expect(token.isRevoked()).toBe(true);
    expect(token.isValid()).toBe(false);
  });

  it('should have correct properties', () => {
    const expiresAt = new Date(Date.now() + 60000);
    const token = new RefreshToken('token-id', 'token-value', 'user-id', expiresAt, false);
    expect(token.id).toBe('token-id');
    expect(token.token).toBe('token-value');
    expect(token.userId).toBe('user-id');
    expect(token.expiresAt).toBe(expiresAt);
  });
});
