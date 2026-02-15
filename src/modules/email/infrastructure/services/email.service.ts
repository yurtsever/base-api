import { Inject, Injectable } from '@nestjs/common';
import type { SendEmailUseCasePort } from '../../application/ports/send-email.use-case';
import { SEND_EMAIL_USE_CASE } from '../../application/ports/send-email.use-case';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  context?: Record<string, unknown>;
}

@Injectable()
export class EmailService {
  constructor(
    @Inject(SEND_EMAIL_USE_CASE)
    private readonly sendEmailUseCase: SendEmailUseCasePort,
  ) {}

  async send(options: EmailOptions): Promise<void> {
    await this.sendEmailUseCase.execute(options);
  }

  async sendFromTemplate(
    to: string | string[],
    subject: string,
    template: string,
    context: Record<string, unknown>,
  ): Promise<void> {
    await this.sendEmailUseCase.execute({ to, subject, template, context });
  }
}
