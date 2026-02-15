export interface SendEmailDto {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  context?: Record<string, unknown>;
}

export interface SendEmailUseCasePort {
  execute(dto: SendEmailDto): Promise<void>;
}

export const SEND_EMAIL_USE_CASE = Symbol('SEND_EMAIL_USE_CASE');
