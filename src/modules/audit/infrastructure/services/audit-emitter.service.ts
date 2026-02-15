import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUDIT_EVENT_NAME, AuditEvent } from '../../application/events/audit.event';

export interface AuditEmitOptions {
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  method?: string;
  path: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
  duration?: number;
}

@Injectable()
export class AuditEmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(options: AuditEmitOptions): void {
    const event = new AuditEvent(options);
    this.eventEmitter.emit(AUDIT_EVENT_NAME, event);
  }
}
