import { AuditEntry } from '../../../domain/models/audit-entry.model';
import { AuditEntryEntity } from '../entities/audit-entry.entity';

export class AuditEntryMapper {
  static toDomain(entity: AuditEntryEntity): AuditEntry {
    return new AuditEntry(
      entity.id,
      entity.action,
      entity.resource,
      entity.resourceId,
      entity.userId,
      entity.userEmail,
      entity.ipAddress,
      entity.method,
      entity.path,
      entity.statusCode,
      entity.metadata,
      entity.duration,
      entity.createdAt,
    );
  }

  static toEntity(domain: AuditEntry): AuditEntryEntity {
    const entity = new AuditEntryEntity();
    entity.id = domain.id;
    entity.action = domain.action;
    entity.resource = domain.resource;
    entity.resourceId = domain.resourceId;
    entity.userId = domain.userId;
    entity.userEmail = domain.userEmail;
    entity.ipAddress = domain.ipAddress;
    entity.method = domain.method;
    entity.path = domain.path;
    entity.statusCode = domain.statusCode;
    entity.metadata = domain.metadata;
    entity.duration = domain.duration;
    return entity;
  }
}
