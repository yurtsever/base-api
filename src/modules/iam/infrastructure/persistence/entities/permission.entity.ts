import { Column, Entity, Index, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infrastructure/database/entities/base.entity';
import { RoleEntity } from './role.entity';

@Entity('permissions')
@Index(['resource', 'action'])
export class PermissionEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  resource!: string;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  description!: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles!: RoleEntity[];
}
