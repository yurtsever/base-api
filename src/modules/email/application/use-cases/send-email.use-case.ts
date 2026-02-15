import { Inject, Injectable } from '@nestjs/common';
import { ValidationException } from '../../../../shared/domain/exceptions/validation.exception';
import { EmailSendFailedException } from '../../domain/exceptions/email-send-failed.exception';
import type { EmailSenderPort } from '../../domain/ports/email-sender.port';
import { EMAIL_SENDER_PORT } from '../../domain/ports/email-sender.port';
import type { SendEmailDto, SendEmailUseCasePort } from '../ports/send-email.use-case';

@Injectable()
export class SendEmailUseCase implements SendEmailUseCasePort {
  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailSender: EmailSenderPort,
  ) {}

  async execute(dto: SendEmailDto): Promise<void> {
    if (!dto.text && !dto.html && !dto.template) {
      throw new ValidationException('At least one of text, html, or template must be provided');
    }

    try {
      await this.emailSender.send(dto);
    } catch (error) {
      if (error instanceof EmailSendFailedException) {
        throw error;
      }
      throw new EmailSendFailedException(error instanceof Error ? error.message : String(error));
    }
  }
}
