import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/database.config';
import { PermissionEntity } from '../../../../modules/iam/infrastructure/persistence/entities/permission.entity';
import { RoleEntity } from '../../../../modules/iam/infrastructure/persistence/entities/role.entity';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  const permissionRepo = dataSource.getRepository(PermissionEntity);
  const roleRepo = dataSource.getRepository(RoleEntity);

  // Seed permissions
  const permissionsData = [
    { resource: 'users', action: 'read', description: 'Read user data' },
    { resource: 'users', action: 'write', description: 'Create and update users' },
    { resource: 'users', action: 'delete', description: 'Delete users' },
    { resource: 'roles', action: 'manage', description: 'Manage roles and permissions' },
  ];

  const permissions: PermissionEntity[] = [];
  for (const p of permissionsData) {
    let permission = await permissionRepo.findOne({
      where: { resource: p.resource, action: p.action },
    });
    if (!permission) {
      permission = permissionRepo.create(p);
      permission = await permissionRepo.save(permission);
      console.log(`Created permission: ${p.resource}:${p.action}`);
    } else {
      console.log(`Permission already exists: ${p.resource}:${p.action}`);
    }
    permissions.push(permission);
  }

  // Seed 'user' role (default, with users:read)
  let userRole = await roleRepo.findOne({ where: { name: 'user' } });
  if (!userRole) {
    userRole = roleRepo.create({
      name: 'user',
      description: 'Default user role',
      isDefault: true,
      permissions: [permissions[0]], // users:read
    });
    await roleRepo.save(userRole);
    console.log('Created role: user (default)');
  } else {
    console.log('Role already exists: user');
  }

  // Seed 'admin' role (all permissions)
  let adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = roleRepo.create({
      name: 'admin',
      description: 'Administrator role with full access',
      isDefault: false,
      permissions: permissions,
    });
    await roleRepo.save(adminRole);
    console.log('Created role: admin');
  } else {
    console.log('Role already exists: admin');
  }

  await dataSource.destroy();
  console.log('Seed completed successfully!');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
