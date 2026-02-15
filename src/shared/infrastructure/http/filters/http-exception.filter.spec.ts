import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { BaseException } from '../../../domain/exceptions/base.exception';
import { MockLogger, createMockLogger } from '../../../../../test/utils/test-helpers';
import { createMockRequest, createMockResponse } from '../../../../../test/utils/mock-factories';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let logger: MockLogger;

  beforeEach(async () => {
    logger = createMockLogger();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HttpExceptionFilter,
          useFactory: () => new HttpExceptionFilter(logger),
        },
      ],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle BaseException correctly', () => {
      const mockRequest = createMockRequest({ url: '/test', method: 'GET' });
      const mockResponse = createMockResponse();
      const exception = new BaseException('TEST_ERROR', 'Test error message', HttpStatus.BAD_REQUEST);

      const host = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as any;

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: 'TEST_ERROR',
          message: 'Test error message',
          path: '/test',
          method: 'GET',
        }),
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle HttpException correctly', () => {
      const mockRequest = createMockRequest({ url: '/test', method: 'POST' });
      const mockResponse = createMockResponse();
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      const host = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as any;

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found',
        }),
      );
    });

    it('should handle unknown errors', () => {
      const mockRequest = createMockRequest();
      const mockResponse = createMockResponse();
      const exception = new Error('Unknown error');

      const host = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as any;

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: 'INTERNAL_SERVER_ERROR',
        }),
      );
    });
  });
});
