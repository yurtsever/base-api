import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { EmailService } from '../../../email/infrastructure/services/email.service';
import { RequestOtpDto } from '../dtos/request-otp.dto';
import type { RequestOtpUseCasePort } from '../ports/request-otp.use-case';

@Injectable()
export class RequestOtpUseCase implements RequestOtpUseCasePort {
  private readonly logger = new Logger(RequestOtpUseCase.name);

  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RequestOtpDto): Promise<{ message: string }> {
    const expiration = this.configService.get<number>('otp.expiration', 300);
    const resendInterval = this.configService.get<number>('otp.resendInterval', 60);
    const expiresMinutes = Math.floor(expiration / 60);

    try {
      const code = await this.authDomainService.requestOtp(dto.email, expiration, resendInterval);

      await this.emailService.sendFromTemplate(dto.email, 'Your login code', 'otp', {
        code,
        expiresMinutes,
      });
    } catch (error) {
      // Log the error but return same message to prevent email enumeration
      this.logger.debug(`OTP request failed for ${dto.email}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }

    return { message: 'If an account exists or can be created, an OTP has been sent' };
  }
}
