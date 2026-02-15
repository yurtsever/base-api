import { Role } from './role.model';
import { Permission } from './permission.model';

describe('Role Model', () => {
  const createRole = () => {
    const permissions = [
      new Permission('p1', 'users', 'read', 'Read users'),
      new Permission('p2', 'users', 'write', 'Write users'),
    ];
    return new Role('role-1', 'admin', 'Admin role', false, permissions);
  };

  it('should check if role has permission', () => {
    const role = createRole();
    expect(role.hasPermission('users', 'read')).toBe(true);
    expect(role.hasPermission('users', 'write')).toBe(true);
    expect(role.hasPermission('users', 'delete')).toBe(false);
  });

  it('should serialize to JSON', () => {
    const role = createRole();
    const json = role.toJSON();
    expect(json).toHaveProperty('id', 'role-1');
    expect(json).toHaveProperty('name', 'admin');
    expect(json).toHaveProperty('description', 'Admin role');
    expect(json).toHaveProperty('isDefault', false);
    expect(json.permissions).toHaveLength(2);
  });

  it('should return a copy of permissions', () => {
    const role = createRole();
    const permissions = role.permissions;
    expect(permissions).toHaveLength(2);
    // Verify it's a copy
    expect(permissions).not.toBe(role.permissions);
  });
});
