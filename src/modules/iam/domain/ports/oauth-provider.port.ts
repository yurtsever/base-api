export interface OAuthUserProfile {
  providerUserId: string;
  email: string;
  /**
   * Whether the provider asserts the email address is verified.
   * The domain layer refuses to find-or-create accounts by email unless this is true,
   * because an email is only an identifier — not proof of ownership.
   */
  emailVerified: boolean;
  firstName: string;
  lastName: string;
}

export interface OAuthProviderPort {
  getProfile(provider: string, code: string, redirectUri: string): Promise<OAuthUserProfile>;
}

export const OAUTH_PROVIDER_PORT = Symbol('OAUTH_PROVIDER_PORT');
