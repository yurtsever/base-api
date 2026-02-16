import { ValueObject } from '../../../../shared/domain/base/value-object';

interface OAuthProviderProps {
  value: string;
}

const SUPPORTED_PROVIDERS = ['google', 'github'] as const;
export type SupportedOAuthProvider = (typeof SUPPORTED_PROVIDERS)[number];

export class OAuthProvider extends ValueObject<OAuthProviderProps> {
  private constructor(props: OAuthProviderProps) {
    super(props);
  }

  static create(provider: string): OAuthProvider {
    const normalized = provider?.trim().toLowerCase();
    if (!normalized || !SUPPORTED_PROVIDERS.includes(normalized as SupportedOAuthProvider)) {
      throw new Error(`Unsupported OAuth provider: ${provider}. Supported: ${SUPPORTED_PROVIDERS.join(', ')}`);
    }

    return new OAuthProvider({ value: normalized });
  }

  get value(): string {
    return this.props.value;
  }

  static get supportedProviders(): readonly string[] {
    return SUPPORTED_PROVIDERS;
  }
}
