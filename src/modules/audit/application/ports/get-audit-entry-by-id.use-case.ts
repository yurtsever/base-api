import type { AuditEntryJson } from './get-audit-entries.use-case';

export interface GetAuditEntryByIdUseCasePort {
  execute(id: string): Promise<AuditEntryJson>;
}

export const GET_AUDIT_ENTRY_BY_ID_USE_CASE = Symbol('GET_AUDIT_ENTRY_BY_ID_USE_CASE');
