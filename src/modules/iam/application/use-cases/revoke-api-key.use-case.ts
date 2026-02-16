import { Inject, Injectable } from '@nestjs/common';
import type { ApiKeyRepositoryPort } from '../../domain/ports/api-key-repository.port';
import { API_KEY_REPOSITORY_PORT } from '../../domain/ports/api-key-repository.port';
import { InvalidApiKeyException } from '../../domain/exceptions/invalid-api-key.exception';
import type { RevokeApiKeyUseCasePort } from '../ports/revoke-api-key.use-case';

@Injectable()
export class RevokeApiKeyUseCase implements RevokeApiKeyUseCasePort {
  constructor(
    @Inject(API_KEY_REPOSITORY_PORT)
    private readonly apiKeyRepository: ApiKeyRepositoryPort,
  ) {}

  async execute(apiKeyId: string, userId: string, isAdmin: boolean): Promise<void> {
    const apiKey = await this.apiKeyRepository.findById(apiKeyId);

    if (!apiKey) {
      throw new InvalidApiKeyException('API key not found');
    }

    if (!isAdmin && apiKey.userId !== userId) {
      throw new InvalidApiKeyException('API key not found');
    }

    await this.apiKeyRepository.revokeById(apiKeyId);
  }
}
