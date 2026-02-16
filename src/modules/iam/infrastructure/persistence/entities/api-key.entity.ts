import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infrastructure/database/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('api_keys')
export class ApiKeyEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 64, unique: true, name: 'key_hash' })
  @Index()
  keyHash!: string;

  @Column({ type: 'varchar', length: 12, name: 'key_prefix' })
  keyPrefix!: string;

  @Column({ type: 'text' })
  scopes!: string;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_used_at' })
  lastUsedAt!: Date | null;

  @Column({ type: 'boolean', default: false, name: 'is_revoked' })
  isRevoked!: boolean;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
