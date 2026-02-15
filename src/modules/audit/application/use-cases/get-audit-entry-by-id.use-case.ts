import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_REPOSITORY_PORT } from '../../domain/ports/audit-repository.port';
import type { AuditRepositoryPort } from '../../domain/ports/audit-repository.port';
import { AuditEntryNotFoundException } from '../../domain/exceptions/audit-entry-not-found.exception';
import type { AuditEntryJson } from '../ports/get-audit-entries.use-case';
import type { GetAuditEntryByIdUseCasePort } from '../ports/get-audit-entry-by-id.use-case';

@Injectable()
export class GetAuditEntryByIdUseCase implements GetAuditEntryByIdUseCasePort {
  constructor(
    @Inject(AUDIT_REPOSITORY_PORT)
    private readonly auditRepository: AuditRepositoryPort,
  ) {}

  async execute(id: string): Promise<AuditEntryJson> {
    const entry = await this.auditRepository.findById(id);
    if (!entry) {
      throw new AuditEntryNotFoundException(id);
    }
    return entry.toJSON();
  }
}
