import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AUDIT_REPOSITORY_PORT } from '../../domain/ports/audit-repository.port';
import type { AuditRepositoryPort } from '../../domain/ports/audit-repository.port';

@Injectable()
export class AuditRetentionCleanupTask {
  private readonly logger = new Logger(AuditRetentionCleanupTask.name);

  constructor(
    @Inject(AUDIT_REPOSITORY_PORT)
    private readonly auditRepository: AuditRepositoryPort,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCleanup(): Promise<void> {
    try {
      const retentionDays = this.configService.get<number>('audit.retentionDays', 90);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deletedCount = await this.auditRepository.deleteOlderThan(cutoffDate);
      this.logger.log(
        `Audit retention cleanup completed: ${deletedCount} entries deleted (older than ${retentionDays} days)`,
      );
    } catch (error) {
      this.logger.error('Failed to clean up old audit entries', error instanceof Error ? error.stack : error);
    }
  }
}
