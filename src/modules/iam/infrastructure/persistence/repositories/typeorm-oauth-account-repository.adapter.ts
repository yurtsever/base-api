import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { OAuthAccountRepositoryPort } from '../../../domain/ports/oauth-account-repository.port';
import { OAuthAccount } from '../../../domain/models/oauth-account.model';
import { OAuthAccountEntity } from '../entities/oauth-account.entity';
import { OAuthAccountMapper } from '../mappers/oauth-account.mapper';

@Injectable()
export class TypeOrmOAuthAccountRepositoryAdapter implements OAuthAccountRepositoryPort {
  constructor(
    @InjectRepository(OAuthAccountEntity)
    private readonly oauthAccountRepository: Repository<OAuthAccountEntity>,
  ) {}

  async save(account: OAuthAccount): Promise<OAuthAccount> {
    const entity = OAuthAccountMapper.toEntity(account);
    const saved = await this.oauthAccountRepository.save(entity);
    return OAuthAccountMapper.toDomain(saved);
  }

  async findByProviderAndProviderUserId(provider: string, providerUserId: string): Promise<OAuthAccount | null> {
    const entity = await this.oauthAccountRepository.findOne({
      where: { provider, providerUserId },
    });
    return entity ? OAuthAccountMapper.toDomain(entity) : null;
  }

  async findAllByUserId(userId: string): Promise<OAuthAccount[]> {
    const entities = await this.oauthAccountRepository.find({
      where: { userId },
    });
    return entities.map((entity) => OAuthAccountMapper.toDomain(entity));
  }

  async deleteByProviderAndUserId(provider: string, userId: string): Promise<void> {
    await this.oauthAccountRepository.softDelete({ provider, userId });
  }
}
