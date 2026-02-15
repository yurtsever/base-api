import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
import { ValidationException } from './validation.exception';

describe('Custom Exceptions', () => {
  describe('BaseException', () => {
    it('should create exception with correct properties', () => {
      const exception = new BaseException('TEST_ERROR', 'Test message', HttpStatus.BAD_REQUEST, { detail: 'test' });

      expect(exception.errorCode).toBe('TEST_ERROR');
      expect(exception.message).toBe('Test message');
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.details).toEqual({ detail: 'test' });
    });

    it('should default to INTERNAL_SERVER_ERROR status', () => {
      const exception = new BaseException('ERROR', 'Error message');
      expect(exception.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('BusinessException', () => {
    it('should create business exception with BAD_REQUEST status', () => {
      const exception = new BusinessException('Business rule violated');

      expect(exception.message).toBe('Business rule violated');
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.errorCode).toBe('BUSINESS_ERROR');
    });

    it('should allow custom error code', () => {
      const exception = new BusinessException('Invalid operation', 'CUSTOM_ERROR');

      expect(exception.errorCode).toBe('CUSTOM_ERROR');
    });
  });

  describe('ValidationException', () => {
    it('should create validation exception with BAD_REQUEST status', () => {
      const exception = new ValidationException('Validation failed', {
        field: 'email',
      });

      expect(exception.message).toBe('Validation failed');
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.errorCode).toBe('VALIDATION_ERROR');
      expect(exception.details).toEqual({ field: 'email' });
    });
  });
});
