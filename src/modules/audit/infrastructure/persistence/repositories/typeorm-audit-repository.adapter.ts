import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import type { PaginatedResult } from '../../../../../shared/application/interfaces';
import type { AuditRepositoryPort, AuditFilterOptions } from '../../../domain/ports/audit-repository.port';
import { AuditEntry } from '../../../domain/models/audit-entry.model';
import { AuditEntryEntity } from '../entities/audit-entry.entity';
import { AuditEntryMapper } from '../mappers/audit-entry.mapper';

@Injectable()
export class TypeOrmAuditRepositoryAdapter implements AuditRepositoryPort {
  constructor(
    @InjectRepository(AuditEntryEntity)
    private readonly auditRepository: Repository<AuditEntryEntity>,
  ) {}

  async save(entry: AuditEntry): Promise<AuditEntry> {
    const entity = AuditEntryMapper.toEntity(entry);
    const saved = await this.auditRepository.save(entity);
    return AuditEntryMapper.toDomain(saved);
  }

  async findById(id: string): Promise<AuditEntry | null> {
    const entity = await this.auditRepository.findOne({ where: { id } });
    return entity ? AuditEntryMapper.toDomain(entity) : null;
  }

  async findAll(filters: AuditFilterOptions): Promise<PaginatedResult<AuditEntry>> {
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    const qb = this.auditRepository.createQueryBuilder('audit');

    if (filters.userId) {
      qb.andWhere('audit.user_id = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      qb.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.resource) {
      qb.andWhere('audit.resource = :resource', { resource: filters.resource });
    }

    if (filters.entityId) {
      qb.andWhere('audit.resource_id = :entityId', { entityId: filters.entityId });
    }

    if (filters.startDate) {
      qb.andWhere('audit.created_at >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      qb.andWhere('audit.created_at <= :endDate', { endDate: filters.endDate });
    }

    qb.orderBy('audit.created_at', 'DESC').skip(offset).take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      items: entities.map((e) => AuditEntryMapper.toDomain(e)),
      meta: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.auditRepository.delete({ createdAt: LessThan(date) });
    return result.affected ?? 0;
  }
}
