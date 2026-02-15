import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { AUDIT_REPOSITORY_PORT } from '../../domain/ports/audit-repository.port';
import type { AuditRepositoryPort } from '../../domain/ports/audit-repository.port';
import { AuditEntry } from '../../domain/models/audit-entry.model';

interface AuthenticatedRequest extends Request {
  user?: { sub?: string; email?: string };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    @Inject(AUDIT_REPOSITORY_PORT)
    private readonly auditRepository: AuditRepositoryPort,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.url.startsWith('/api/health')) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          this.saveAuditEntry(request, response.statusCode, startTime);
        },
        error: (error: { status?: number; getStatus?: () => number }) => {
          const statusCode = error?.getStatus?.() ?? error?.status ?? 500;
          this.saveAuditEntry(request, statusCode, startTime);
        },
      }),
    );
  }

  private saveAuditEntry(request: AuthenticatedRequest, statusCode: number, startTime: number): void {
    const duration = Date.now() - startTime;
    const pathSegments = request.url.split('/').filter(Boolean);
    const resource = pathSegments[1] || pathSegments[0] || 'unknown';

    const entry = AuditEntry.create({
      action: 'HTTP_REQUEST',
      resource,
      resourceId: pathSegments[2],
      userId: request.user?.sub,
      userEmail: request.user?.email,
      ipAddress: request.ip || '0.0.0.0',
      method: request.method,
      path: request.url,
      statusCode,
      duration,
    });

    this.auditRepository.save(entry).catch((error) => {
      this.logger.error('Failed to save audit entry', error instanceof Error ? error.stack : error);
    });
  }
}
