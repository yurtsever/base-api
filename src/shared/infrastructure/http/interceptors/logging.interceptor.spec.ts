import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';
import { MockLogger, createMockLogger } from '../../../../../test/utils/test-helpers';
import { createMockExecutionContext } from '../../../../../test/utils/mock-factories';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logger: MockLogger;

  beforeEach(async () => {
    logger = createMockLogger();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggingInterceptor,
          useFactory: () => new LoggingInterceptor(logger),
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log successful requests', (done) => {
    const mockContext = createMockExecutionContext(
      { method: 'GET', url: '/test', id: 'request-123' },
      { statusCode: 200 },
    );
    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    };

    interceptor.intercept(mockContext, mockCallHandler as any).subscribe({
      next: () => {
        expect(logger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            requestId: 'request-123',
            method: 'GET',
            url: '/test',
            statusCode: 200,
          }),
        );
        done();
      },
    });
  });
});
