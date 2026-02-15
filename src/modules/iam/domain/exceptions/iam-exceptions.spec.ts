import { HttpStatus } from '@nestjs/common';
import { InvalidCredentialsException } from './invalid-credentials.exception';
import { UserAlreadyExistsException } from './user-already-exists.exception';
import { UserNotFoundException } from './user-not-found.exception';
import { TokenExpiredException } from './token-expired.exception';
import { InsufficientPermissionsException } from './insufficient-permissions.exception';

describe('IAM Exceptions', () => {
  describe('InvalidCredentialsException', () => {
    it('should have correct properties', () => {
      const exception = new InvalidCredentialsException();
      expect(exception.errorCode).toBe('INVALID_CREDENTIALS');
      expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(exception.message).toBe('Invalid email or password');
    });

    it('should accept custom message', () => {
      const exception = new InvalidCredentialsException('Account locked');
      expect(exception.message).toBe('Account locked');
    });
  });

  describe('UserAlreadyExistsException', () => {
    it('should have correct properties', () => {
      const exception = new UserAlreadyExistsException('test@example.com');
      expect(exception.errorCode).toBe('USER_ALREADY_EXISTS');
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toContain('test@example.com');
    });
  });

  describe('UserNotFoundException', () => {
    it('should have correct properties', () => {
      const exception = new UserNotFoundException('user-123');
      expect(exception.errorCode).toBe('USER_NOT_FOUND');
      expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(exception.message).toContain('user-123');
    });
  });

  describe('TokenExpiredException', () => {
    it('should have correct properties', () => {
      const exception = new TokenExpiredException();
      expect(exception.errorCode).toBe('TOKEN_EXPIRED');
      expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(exception.message).toBe('Token has expired');
    });
  });

  describe('InsufficientPermissionsException', () => {
    it('should have correct properties', () => {
      const exception = new InsufficientPermissionsException();
      expect(exception.errorCode).toBe('INSUFFICIENT_PERMISSIONS');
      expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(exception.message).toBe('Insufficient permissions');
    });
  });
});
