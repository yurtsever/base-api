import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infrastructure/database/entities/base.entity';

@Entity('audit_entries')
export class AuditEntryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  @Index('idx_audit_entries_action')
  action!: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_audit_entries_resource')
  resource!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'resource_id' })
  resourceId?: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  @Index('idx_audit_entries_user_id')
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'user_email' })
  userEmail?: string;

  @Column({ type: 'varchar', length: 45, name: 'ip_address' })
  ipAddress!: string;

  @Column({ type: 'varchar', length: 10 })
  method!: string;

  @Column({ type: 'varchar', length: 2048 })
  path!: string;

  @Column({ type: 'int', name: 'status_code' })
  statusCode!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  duration!: number;
}
