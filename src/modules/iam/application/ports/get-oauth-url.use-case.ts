export interface GetOAuthUrlUseCasePort {
  /**
   * @param userId when set, binds the issued state to this user for account linking (link-CSRF defense).
   *               Null/omitted for the public login flow.
   */
  execute(provider: string, redirectUri: string, userId?: string | null): Promise<{ url: string; state: string }>;
}

export const GET_OAUTH_URL_USE_CASE = Symbol('GET_OAUTH_URL_USE_CASE');
