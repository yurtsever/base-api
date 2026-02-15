import type { PaginatedResult } from '../../../../shared/application/interfaces';
import type { AuditFilterOptions } from '../../domain/ports/audit-repository.port';

export interface AuditEntryJson {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  method: string;
  path: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
  duration: number;
  createdAt: string;
}

export interface GetAuditEntriesUseCasePort {
  execute(filters: AuditFilterOptions): Promise<PaginatedResult<AuditEntryJson>>;
}

export const GET_AUDIT_ENTRIES_USE_CASE = Symbol('GET_AUDIT_ENTRIES_USE_CASE');
