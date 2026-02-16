import { CreateApiKeyDto } from '../dtos/create-api-key.dto';

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  scopes: string[];
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyUseCasePort {
  execute(userId: string, dto: CreateApiKeyDto): Promise<CreateApiKeyResponse>;
}

export const CREATE_API_KEY_USE_CASE = Symbol('CREATE_API_KEY_USE_CASE');
