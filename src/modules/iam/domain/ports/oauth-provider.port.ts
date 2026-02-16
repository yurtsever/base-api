export interface OAuthUserProfile {
  providerUserId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface OAuthProviderPort {
  getProfile(provider: string, code: string, redirectUri: string): Promise<OAuthUserProfile>;
}

export const OAUTH_PROVIDER_PORT = Symbol('OAUTH_PROVIDER_PORT');
