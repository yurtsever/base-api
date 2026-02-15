export interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  context?: Record<string, unknown>;
}

export interface EmailSenderPort {
  send(message: EmailMessage): Promise<void>;
}

export const EMAIL_SENDER_PORT = Symbol('EMAIL_SENDER_PORT');
