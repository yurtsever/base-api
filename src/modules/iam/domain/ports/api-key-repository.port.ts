import { ApiKey } from '../models/api-key.model';

export interface ApiKeyRepositoryPort {
  save(apiKey: ApiKey): Promise<ApiKey>;
  findByKeyHash(keyHash: string): Promise<ApiKey | null>;
  findAllByUserId(userId: string): Promise<ApiKey[]>;
  findById(id: string): Promise<ApiKey | null>;
  revokeById(id: string): Promise<void>;
  updateLastUsed(id: string): Promise<void>;
}

export const API_KEY_REPOSITORY_PORT = Symbol('API_KEY_REPOSITORY_PORT');
