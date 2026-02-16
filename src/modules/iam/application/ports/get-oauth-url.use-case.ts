export interface GetOAuthUrlUseCasePort {
  execute(provider: string, redirectUri: string): { url: string; state: string };
}

export const GET_OAUTH_URL_USE_CASE = Symbol('GET_OAUTH_URL_USE_CASE');
