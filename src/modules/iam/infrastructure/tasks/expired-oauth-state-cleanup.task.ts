import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OAUTH_STATE_REPOSITORY_PORT } from '../../domain/ports/oauth-state-repository.port';
import type { OAuthStateRepositoryPort } from '../../domain/ports/oauth-state-repository.port';

@Injectable()
export class ExpiredOAuthStateCleanupTask {
  private readonly logger = new Logger(ExpiredOAuthStateCleanupTask.name);

  constructor(
    @Inject(OAUTH_STATE_REPOSITORY_PORT)
    private readonly oauthStateRepository: OAuthStateRepositoryPort,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup(): Promise<void> {
    try {
      await this.oauthStateRepository.deleteExpired();
      this.logger.log('Expired OAuth states cleaned up successfully');
    } catch (error) {
      this.logger.error('Failed to clean up expired OAuth states', error instanceof Error ? error.stack : error);
    }
  }
}
