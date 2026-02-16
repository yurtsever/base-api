import { HttpStatus } from '@nestjs/common';
import { InvalidApiKeyException } from './invalid-api-key.exception';

describe('InvalidApiKeyException', () => {
  it('should have correct properties', () => {
    const exception = new InvalidApiKeyException();
    expect(exception.errorCode).toBe('INVALID_API_KEY');
    expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(exception.message).toBe('Invalid or expired API key');
  });

  it('should accept custom message', () => {
    const exception = new InvalidApiKeyException('API key not found');
    expect(exception.message).toBe('API key not found');
  });
});
