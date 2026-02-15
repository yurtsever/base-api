import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Persistence
import { AuditEntryEntity } from './infrastructure/persistence/entities/audit-entry.entity';
import { TypeOrmAuditRepositoryAdapter } from './infrastructure/persistence/repositories/typeorm-audit-repository.adapter';

// Domain Ports
import { AUDIT_REPOSITORY_PORT } from './domain/ports/audit-repository.port';

// Application Use Cases
import { GET_AUDIT_ENTRIES_USE_CASE } from './application/ports/get-audit-entries.use-case';
import { GET_AUDIT_ENTRY_BY_ID_USE_CASE } from './application/ports/get-audit-entry-by-id.use-case';
import { GetAuditEntriesUseCase } from './application/use-cases/get-audit-entries.use-case';
import { GetAuditEntryByIdUseCase } from './application/use-cases/get-audit-entry-by-id.use-case';

// Infrastructure
import { AuditInterceptor } from './infrastructure/interceptors/audit.interceptor';
import { AuditEventListener } from './infrastructure/listeners/audit-event.listener';
import { AuditEmitterService } from './infrastructure/services/audit-emitter.service';
import { AuditRetentionCleanupTask } from './infrastructure/tasks/audit-retention-cleanup.task';
import { AuditController } from './infrastructure/controllers/audit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditEntryEntity])],
  controllers: [AuditController],
  providers: [
    // Output Adapters (implementing Domain Ports)
    {
      provide: AUDIT_REPOSITORY_PORT,
      useClass: TypeOrmAuditRepositoryAdapter,
    },

    // Use Cases (Input Ports)
    { provide: GET_AUDIT_ENTRIES_USE_CASE, useClass: GetAuditEntriesUseCase },
    { provide: GET_AUDIT_ENTRY_BY_ID_USE_CASE, useClass: GetAuditEntryByIdUseCase },

    // Infrastructure Services
    AuditInterceptor,
    AuditEventListener,
    AuditEmitterService,
    AuditRetentionCleanupTask,
  ],
  exports: [AuditEmitterService, AUDIT_REPOSITORY_PORT, AuditInterceptor],
})
export class AuditModule {}
