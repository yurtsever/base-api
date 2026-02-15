import type { PaginatedResult, PaginationOptions } from '../../../../shared/application/interfaces';
import type { AuditEntry } from '../models/audit-entry.model';

export interface AuditFilterOptions extends PaginationOptions {
  userId?: string;
  action?: string;
  resource?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AuditRepositoryPort {
  save(entry: AuditEntry): Promise<AuditEntry>;
  findById(id: string): Promise<AuditEntry | null>;
  findAll(filters: AuditFilterOptions): Promise<PaginatedResult<AuditEntry>>;
  deleteOlderThan(date: Date): Promise<number>;
}

export const AUDIT_REPOSITORY_PORT = Symbol('AUDIT_REPOSITORY_PORT');
