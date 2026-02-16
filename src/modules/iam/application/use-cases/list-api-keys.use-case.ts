import { Inject, Injectable } from '@nestjs/common';
import type { ApiKeyRepositoryPort } from '../../domain/ports/api-key-repository.port';
import { API_KEY_REPOSITORY_PORT } from '../../domain/ports/api-key-repository.port';
import type { ApiKeyListItem, ListApiKeysUseCasePort } from '../ports/list-api-keys.use-case';

@Injectable()
export class ListApiKeysUseCase implements ListApiKeysUseCasePort {
  constructor(
    @Inject(API_KEY_REPOSITORY_PORT)
    private readonly apiKeyRepository: ApiKeyRepositoryPort,
  ) {}

  async execute(userId: string): Promise<ApiKeyListItem[]> {
    const apiKeys = await this.apiKeyRepository.findAllByUserId(userId);

    return apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      scopes: key.scopes,
      expiresAt: key.expiresAt?.toISOString() ?? null,
      lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
      isRevoked: key.isRevoked,
      createdAt: key.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  }
}
