import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailSendFailedException } from '../../domain/exceptions/email-send-failed.exception';
import type { EmailMessage, EmailSenderPort } from '../../domain/ports/email-sender.port';

@Injectable()
export class NodemailerEmailSenderAdapter implements EmailSenderPort {
  constructor(private readonly mailerService: MailerService) {}

  async send(message: EmailMessage): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        template: message.template,
        context: message.context,
      });
    } catch (error) {
      throw new EmailSendFailedException(error instanceof Error ? error.message : String(error));
    }
  }
}
