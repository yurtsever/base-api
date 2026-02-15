import { ValueObject } from '../../../../shared/domain/base/value-object';

interface PasswordProps {
  value: string;
  isHashed: boolean;
}

export class Password extends ValueObject<PasswordProps> {
  private static readonly MIN_LENGTH = 8;
  private static readonly STRENGTH_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  private constructor(props: PasswordProps) {
    super(props);
  }

  static createFromPlaintext(password: string): Password {
    if (!password || password.length < Password.MIN_LENGTH) {
      throw new Error(`Password must be at least ${Password.MIN_LENGTH} characters long`);
    }

    if (!Password.STRENGTH_REGEX.test(password)) {
      throw new Error(
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
      );
    }

    return new Password({ value: password, isHashed: false });
  }

  static createFromHash(hash: string): Password {
    return new Password({ value: hash, isHashed: true });
  }

  get value(): string {
    return this.props.value;
  }

  get isHashed(): boolean {
    return this.props.isHashed;
  }
}
