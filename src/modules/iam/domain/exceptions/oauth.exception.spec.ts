import { HttpStatus } from '@nestjs/common';
import { OAuthException } from './oauth.exception';

describe('OAuthException', () => {
  it('should have default message', () => {
    const exception = new OAuthException();
    expect(exception.message).toBe('OAuth authentication failed');
    expect(exception.errorCode).toBe('OAUTH_ERROR');
    expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should accept custom message', () => {
    const exception = new OAuthException('Custom OAuth error');
    expect(exception.message).toBe('Custom OAuth error');
    expect(exception.errorCode).toBe('OAUTH_ERROR');
    expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
  });
});
