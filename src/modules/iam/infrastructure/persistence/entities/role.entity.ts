import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infrastructure/database/entities/base.entity';
import { PermissionEntity } from './permission.entity';
import { UserEntity } from './user.entity';

@Entity('roles')
export class RoleEntity extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  description!: string;

  @Index()
  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault!: boolean;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: PermissionEntity[];

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users!: UserEntity[];
}
