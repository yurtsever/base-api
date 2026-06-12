import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Repository } from 'typeorm';
import type { OAuthStateRepositoryPort } from '../../../domain/ports/oauth-state-repository.port';
import { OAuthState } from '../../../domain/models/oauth-state.model';
import { OAuthStateEntity } from '../entities/oauth-state.entity';
import { OAuthStateMapper } from '../mappers/oauth-state.mapper';

@Injectable()
export class TypeOrmOAuthStateRepositoryAdapter implements OAuthStateRepositoryPort {
  constructor(
    @InjectRepository(OAuthStateEntity)
    private readonly oauthStateRepository: Repository<OAuthStateEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async save(state: OAuthState): Promise<void> {
    await this.oauthStateRepository.save(OAuthStateMapper.toEntity(state));
  }

  async consume(state: string): Promise<OAuthState | null> {
    // Atomically read and delete so a state can only ever be redeemed once.
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(OAuthStateEntity);
      // Take a row-level write lock so a concurrent consume() blocks until this
      // transaction commits the delete — preventing a double-redeem race.
      const entity = await repo.findOne({ where: { state }, lock: { mode: 'pessimistic_write' } });
      if (!entity) {
        return null;
      }
      await repo.delete({ id: entity.id });
      return OAuthStateMapper.toDomain(entity);
    });
  }

  async deleteExpired(): Promise<void> {
    await this.oauthStateRepository.delete({ expiresAt: LessThan(new Date()) });
  }
}
