import { Column, Entity, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infrastructure/database/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('oauth_accounts')
@Unique(['provider', 'providerUserId'])
export class OAuthAccountEntity extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  provider!: string;

  @Column({ type: 'varchar', length: 255, name: 'provider_user_id' })
  providerUserId!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
