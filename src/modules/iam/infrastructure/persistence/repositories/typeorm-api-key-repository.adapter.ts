import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ApiKeyRepositoryPort } from '../../../domain/ports/api-key-repository.port';
import { ApiKey } from '../../../domain/models/api-key.model';
import { ApiKeyEntity } from '../entities/api-key.entity';
import { ApiKeyMapper } from '../mappers/api-key.mapper';

@Injectable()
export class TypeOrmApiKeyRepositoryAdapter implements ApiKeyRepositoryPort {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
  ) {}

  async save(apiKey: ApiKey): Promise<ApiKey> {
    const entity = ApiKeyMapper.toEntity(apiKey);
    const saved = await this.apiKeyRepository.save(entity);
    return ApiKeyMapper.toDomain(saved);
  }

  async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    const entity = await this.apiKeyRepository.findOne({
      where: { keyHash },
    });
    return entity ? ApiKeyMapper.toDomain(entity) : null;
  }

  async findAllByUserId(userId: string): Promise<ApiKey[]> {
    const entities = await this.apiKeyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => ApiKeyMapper.toDomain(e));
  }

  async findById(id: string): Promise<ApiKey | null> {
    const entity = await this.apiKeyRepository.findOne({
      where: { id },
    });
    return entity ? ApiKeyMapper.toDomain(entity) : null;
  }

  async revokeById(id: string): Promise<void> {
    await this.apiKeyRepository.update(id, { isRevoked: true });
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.apiKeyRepository.update(id, { lastUsedAt: new Date() });
  }
}
