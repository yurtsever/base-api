import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import type { AuditRepositoryPort } from '../../domain/ports/audit-repository.port';
import type { AuditEntry } from '../../domain/models/audit-entry.model';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditRepository: { save: jest.Mock };

  beforeEach(() => {
    auditRepository = { save: jest.fn().mockResolvedValue(undefined) };
    interceptor = new AuditInterceptor(auditRepository as unknown as AuditRepositoryPort);
  });

  const createExecutionContext = (
    overrides: Partial<{ method: string; url: string; ip: string; user: { sub: string; email: string } }> = {},
  ): ExecutionContext => {
    const request = {
      method: overrides.method ?? 'GET',
      url: overrides.url ?? '/api/users',
      ip: overrides.ip ?? '127.0.0.1',
      user: overrides.user ?? { sub: 'user-1', email: 'test@example.com' },
    };

    const response = { statusCode: 200 };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
  };

  it('should skip health check endpoints', (done) => {
    const context = createExecutionContext({ url: '/api/health/liveness' });
    const handler: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, handler).subscribe({
      complete: () => {
        expect(auditRepository.save).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should save audit entry on successful response', (done) => {
    const context = createExecutionContext();
    const handler: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, handler).subscribe({
      complete: () => {
        expect(auditRepository.save).toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const savedEntry = auditRepository.save.mock.calls[0][0] as AuditEntry;
        expect(savedEntry.action).toBe('HTTP_REQUEST');
        expect(savedEntry.resource).toBe('users');
        expect(savedEntry.method).toBe('GET');
        expect(savedEntry.userId).toBe('user-1');
        done();
      },
    });
  });

  it('should save audit entry on error response', (done) => {
    const context = createExecutionContext();
    const error = { getStatus: () => 404 };
    const handler: CallHandler = { handle: () => throwError(() => error) };

    interceptor.intercept(context, handler).subscribe({
      error: () => {
        expect(auditRepository.save).toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const savedEntry = auditRepository.save.mock.calls[0][0] as AuditEntry;
        expect(savedEntry.statusCode).toBe(404);
        done();
      },
    });
  });

  it('should not fail if audit save throws', (done) => {
    auditRepository.save.mockRejectedValue(new Error('DB error'));
    const context = createExecutionContext();
    const handler: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, handler).subscribe({
      complete: () => {
        expect(auditRepository.save).toHaveBeenCalled();
        done();
      },
    });
  });
});
