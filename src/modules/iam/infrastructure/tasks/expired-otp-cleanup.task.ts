import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OTP_REPOSITORY_PORT } from '../../domain/ports/otp-repository.port';
import type { OtpRepositoryPort } from '../../domain/ports/otp-repository.port';

@Injectable()
export class ExpiredOtpCleanupTask {
  private readonly logger = new Logger(ExpiredOtpCleanupTask.name);

  constructor(
    @Inject(OTP_REPOSITORY_PORT)
    private readonly otpRepository: OtpRepositoryPort,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleCleanup(): Promise<void> {
    try {
      await this.otpRepository.deleteExpired();
      this.logger.log('Expired OTP codes cleaned up successfully');
    } catch (error) {
      this.logger.error('Failed to clean up expired OTP codes', error instanceof Error ? error.stack : error);
    }
  }
}
