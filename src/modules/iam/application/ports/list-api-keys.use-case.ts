export interface ApiKeyListItem {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  isRevoked: boolean;
  createdAt: string;
}

export interface ListApiKeysUseCasePort {
  execute(userId: string): Promise<ApiKeyListItem[]>;
}

export const LIST_API_KEYS_USE_CASE = Symbol('LIST_API_KEYS_USE_CASE');
