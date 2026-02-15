import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUDIT_EVENT_NAME, AuditEvent } from '../../application/events/audit.event';
import { AUDIT_REPOSITORY_PORT } from '../../domain/ports/audit-repository.port';
import type { AuditRepositoryPort } from '../../domain/ports/audit-repository.port';
import { AuditEntry } from '../../domain/models/audit-entry.model';

@Injectable()
export class AuditEventListener {
  private readonly logger = new Logger(AuditEventListener.name);

  constructor(
    @Inject(AUDIT_REPOSITORY_PORT)
    private readonly auditRepository: AuditRepositoryPort,
  ) {}

  @OnEvent(AUDIT_EVENT_NAME, { async: true })
  async handleAuditEvent(event: AuditEvent): Promise<void> {
    try {
      const entry = AuditEntry.create({
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        userId: event.userId,
        userEmail: event.userEmail,
        ipAddress: event.ipAddress,
        method: event.method,
        path: event.path,
        statusCode: event.statusCode,
        metadata: event.metadata,
        duration: event.duration,
      });

      await this.auditRepository.save(entry);
    } catch (error) {
      this.logger.error('Failed to persist audit event', error instanceof Error ? error.stack : error);
    }
  }
}
