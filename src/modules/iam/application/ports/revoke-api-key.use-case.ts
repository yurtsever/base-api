export interface RevokeApiKeyUseCasePort {
  execute(apiKeyId: string, userId: string, isAdmin: boolean): Promise<void>;
}

export const REVOKE_API_KEY_USE_CASE = Symbol('REVOKE_API_KEY_USE_CASE');
