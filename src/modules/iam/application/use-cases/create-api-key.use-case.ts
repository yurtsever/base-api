import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ApiKey } from '../../domain/models/api-key.model';
import type { ApiKeyRepositoryPort } from '../../domain/ports/api-key-repository.port';
import { API_KEY_REPOSITORY_PORT } from '../../domain/ports/api-key-repository.port';
import type { ApiKeyHasherPort } from '../../domain/ports/api-key-hasher.port';
import { API_KEY_HASHER_PORT } from '../../domain/ports/api-key-hasher.port';
import { CreateApiKeyDto } from '../dtos/create-api-key.dto';
import type { CreateApiKeyResponse, CreateApiKeyUseCasePort } from '../ports/create-api-key.use-case';

@Injectable()
export class CreateApiKeyUseCase implements CreateApiKeyUseCasePort {
  constructor(
    @Inject(API_KEY_REPOSITORY_PORT)
    private readonly apiKeyRepository: ApiKeyRepositoryPort,
    @Inject(API_KEY_HASHER_PORT)
    private readonly apiKeyHasher: ApiKeyHasherPort,
  ) {}

  async execute(userId: string, dto: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
    const { raw, hash, prefix } = this.apiKeyHasher.generateKey();

    const apiKey = new ApiKey(
      randomUUID(),
      userId,
      dto.name,
      hash,
      prefix,
      dto.scopes,
      dto.expiresAt ? new Date(dto.expiresAt) : null,
      null,
      false,
    );

    const saved = await this.apiKeyRepository.save(apiKey);

    return {
      id: saved.id,
      name: saved.name,
      key: raw,
      keyPrefix: saved.keyPrefix,
      scopes: saved.scopes,
      expiresAt: saved.expiresAt?.toISOString() ?? null,
      createdAt: saved.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
