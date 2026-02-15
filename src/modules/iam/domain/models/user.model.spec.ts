import { User } from './user.model';
import { Role } from './role.model';
import { Permission } from './permission.model';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';

describe('User Model', () => {
  const createUser = (roles: Role[] = []) => {
    return new User(
      'user-id',
      Email.create('test@example.com'),
      Password.createFromHash('hashed-password'),
      'John',
      'Doe',
      true,
      roles,
      new Date('2024-01-01'),
      new Date('2024-01-02'),
    );
  };

  const createRoleWithPermissions = () => {
    const permission = new Permission('perm-1', 'users', 'read', 'Read users');
    return new Role('role-1', 'admin', 'Admin role', false, [permission]);
  };

  it('should return full name', () => {
    const user = createUser();
    expect(user.fullName).toBe('John Doe');
  });

  it('should check if user has role', () => {
    const role = createRoleWithPermissions();
    const user = createUser([role]);
    expect(user.hasRole('admin')).toBe(true);
    expect(user.hasRole('user')).toBe(false);
  });

  it('should check if user has permission', () => {
    const role = createRoleWithPermissions();
    const user = createUser([role]);
    expect(user.hasPermission('users', 'read')).toBe(true);
    expect(user.hasPermission('users', 'write')).toBe(false);
  });

  it('should serialize to JSON without password', () => {
    const user = createUser();
    const json = user.toJSON();
    expect(json).toHaveProperty('id', 'user-id');
    expect(json).toHaveProperty('email', 'test@example.com');
    expect(json).toHaveProperty('firstName', 'John');
    expect(json).toHaveProperty('lastName', 'Doe');
    expect(json).toHaveProperty('fullName', 'John Doe');
    expect(json).toHaveProperty('isActive', true);
    expect(json).not.toHaveProperty('password');
  });

  it('should have correct properties', () => {
    const user = createUser();
    expect(user.id).toBe('user-id');
    expect(user.email.value).toBe('test@example.com');
    expect(user.isActive).toBe(true);
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
  });
});
