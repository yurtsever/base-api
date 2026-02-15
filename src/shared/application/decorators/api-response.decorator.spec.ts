import { ApiStandardResponse, ApiErrorResponse, ApiStandardResponses } from './api-response.decorator';
import { applyDecorators } from '@nestjs/common';

// Mock class for testing
class TestDto {
  name!: string;
}

describe('API Response Decorators', () => {
  describe('ApiStandardResponse', () => {
    it('should create decorator with model', () => {
      const decorator = ApiStandardResponse(TestDto, {
        status: 200,
        description: 'Success',
      });

      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiErrorResponse', () => {
    it('should create error response decorator', () => {
      const decorator = ApiErrorResponse(404, 'NOT_FOUND', 'Resource not found');

      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiStandardResponses', () => {
    it('should create standard response decorators', () => {
      const decorator = ApiStandardResponses();

      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });
  });
});
