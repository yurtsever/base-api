import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';
import { createMockExecutionContext } from '../../../../../test/utils/mock-factories';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor = module.get<TransformInterceptor<any>>(TransformInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response to standard format', (done) => {
    const mockContext = createMockExecutionContext({ url: '/test' }, { statusCode: 200 });
    const mockCallHandler = {
      handle: () => of({ name: 'Test' }),
    };

    interceptor.intercept(mockContext, mockCallHandler as any).subscribe({
      next: (result) => {
        expect(result).toHaveProperty('statusCode', 200);
        expect(result).toHaveProperty('data', { name: 'Test' });
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('path', '/test');
        done();
      },
    });
  });
});
