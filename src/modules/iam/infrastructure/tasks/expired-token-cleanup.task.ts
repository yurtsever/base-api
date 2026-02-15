import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { REFRESH_TOKEN_REPOSITORY_PORT } from '../../domain/ports/refresh-token-repository.port';
import type { RefreshTokenRepositoryPort } from '../../domain/ports/refresh-token-repository.port';

@Injectable()
export class ExpiredTokenCleanupTask {
  private readonly logger = new Logger(ExpiredTokenCleanupTask.name);

  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY_PORT)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanup(): Promise<void> {
    try {
      await this.refreshTokenRepository.deleteExpired();
      this.logger.log('Expired refresh tokens cleaned up successfully');
    } catch (error) {
      this.logger.error('Failed to clean up expired refresh tokens', error instanceof Error ? error.stack : error);
    }
  }
}
