import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/application/interfaces';
import { AUDIT_REPOSITORY_PORT } from '../../domain/ports/audit-repository.port';
import type { AuditRepositoryPort, AuditFilterOptions } from '../../domain/ports/audit-repository.port';
import type { AuditEntryJson, GetAuditEntriesUseCasePort } from '../ports/get-audit-entries.use-case';

@Injectable()
export class GetAuditEntriesUseCase implements GetAuditEntriesUseCasePort {
  constructor(
    @Inject(AUDIT_REPOSITORY_PORT)
    private readonly auditRepository: AuditRepositoryPort,
  ) {}

  async execute(filters: AuditFilterOptions): Promise<PaginatedResult<AuditEntryJson>> {
    const result = await this.auditRepository.findAll(filters);
    return {
      items: result.items.map((entry) => entry.toJSON()),
      meta: result.meta,
    };
  }
}
