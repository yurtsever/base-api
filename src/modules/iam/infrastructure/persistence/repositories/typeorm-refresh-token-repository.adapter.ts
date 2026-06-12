import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { DataSource, LessThan, Repository } from 'typeorm';
import type { RefreshTokenRepositoryPort } from '../../../domain/ports/refresh-token-repository.port';
import { RefreshToken } from '../../../domain/models/refresh-token.model';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { RefreshTokenMapper } from '../mappers/refresh-token.mapper';

@Injectable()
export class TypeOrmRefreshTokenRepositoryAdapter implements RefreshTokenRepositoryPort {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // Refresh tokens are high-entropy random values, so a fast SHA-256 (not bcrypt) is the
  // right primitive — only the hash is persisted, mirroring how API keys are stored.
  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async save(token: RefreshToken): Promise<RefreshToken> {
    const entity = RefreshTokenMapper.toEntity(token, this.hash(token.token));
    const saved = await this.refreshTokenRepository.save(entity);
    return RefreshTokenMapper.toDomain(saved);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const entity = await this.refreshTokenRepository.findOne({ where: { tokenHash: this.hash(token) } });
    return entity ? RefreshTokenMapper.toDomain(entity) : null;
  }

  async revokeByToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ tokenHash: this.hash(token) }, { isRevoked: true });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.refreshTokenRepository.update({ familyId, isRevoked: false }, { isRevoked: true });
  }

  async deleteExpired(): Promise<void> {
    await this.refreshTokenRepository.delete({ expiresAt: LessThan(new Date()) });
  }

  async rotateToken(oldTokenValue: string, newToken: RefreshToken): Promise<RefreshToken> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RefreshTokenEntity);
      await repo.update({ tokenHash: this.hash(oldTokenValue) }, { isRevoked: true });
      const entity = RefreshTokenMapper.toEntity(newToken, this.hash(newToken.token));
      const saved = await repo.save(entity);
      return RefreshTokenMapper.toDomain(saved);
    });
  }
}
