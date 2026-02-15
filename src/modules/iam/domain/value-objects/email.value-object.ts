import { ValueObject } from '../../../../shared/domain/base/value-object';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  static create(email: string): Email {
    const trimmed = email?.trim();
    if (!trimmed || !Email.EMAIL_REGEX.test(trimmed)) {
      throw new Error(`Invalid email address: ${email}`);
    }

    return new Email({ value: trimmed.toLowerCase() });
  }

  get value(): string {
    return this.props.value;
  }
}
