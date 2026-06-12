import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oauth_states')
export class OAuthStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 128, unique: true })
  state!: string;

  @Column({ type: 'varchar', length: 50 })
  provider!: string;

  // Set only for account-linking states — binds the OAuth round-trip to the initiating user.
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId!: string | null;

  @Index()
  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt!: Date;
}
