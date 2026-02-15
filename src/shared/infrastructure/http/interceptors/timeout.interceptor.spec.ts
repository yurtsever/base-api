import { RequestTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, delay } from 'rxjs';
import { TimeoutInterceptor } from './timeout.interceptor';
import { createMockExecutionContext } from '../../../../../test/utils/mock-factories';

describe('TimeoutInterceptor', () => {
  let interceptor: TimeoutInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TimeoutInterceptor,
          useFactory: () => new TimeoutInterceptor(100),
        },
      ],
    }).compile();

    interceptor = module.get<TimeoutInterceptor>(TimeoutInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should allow requests that complete in time', (done) => {
    const mockContext = createMockExecutionContext();
    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    };

    interceptor.intercept(mockContext, mockCallHandler as any).subscribe({
      next: (result) => {
        expect(result).toEqual({ data: 'test' });
        done();
      },
    });
  });

  it('should throw timeout exception for slow requests', (done) => {
    const mockContext = createMockExecutionContext();
    const mockCallHandler = {
      handle: () => of({ data: 'test' }).pipe(delay(200)),
    };

    interceptor.intercept(mockContext, mockCallHandler as any).subscribe({
      error: (error) => {
        expect(error).toBeInstanceOf(RequestTimeoutException);
        done();
      },
    });
  });
});
