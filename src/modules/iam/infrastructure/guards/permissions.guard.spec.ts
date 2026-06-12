import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import type { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/models/user.model';
import { Role } from '../../domain/models/role.model';
import { Permission } from '../../domain/models/permission.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let userRepository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    reflector = new Reflector();
    userRepository = { findById: jest.fn() } as unknown as jest.Mocked<UserRepositoryPort>;
    guard = new PermissionsGuard(reflector, userRepository);
  });

  const createContext = (user: Record<string, unknown> | null = null): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('should return true for public routes', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);
    expect(await guard.canActivate(createContext())).toBe(true);
  });

  it('should return true when no permissions required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(null);
    expect(await guard.canActivate(createContext({ sub: 'user-id' }))).toBe(true);
  });

  it('should allow user with required permissions', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(['users:read']);

    const permission = new Permission('p1', 'users', 'read', 'Read users');
    const role = new Role('r1', 'user', 'Default', true, [permission]);
    const user = new User(
      'user-id',
      Email.create('test@example.com'),
      Password.createFromHash('hash'),
      'John',
      'Doe',
      true,
      [role],
    );

    userRepository.findById.mockResolvedValue(user);

    expect(await guard.canActivate(createContext({ sub: 'user-id' }))).toBe(true);
  });

  it('should deny user without required permissions', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(['users:delete']);

    const permission = new Permission('p1', 'users', 'read', 'Read users');
    const role = new Role('r1', 'user', 'Default', true, [permission]);
    const user = new User(
      'user-id',
      Email.create('test@example.com'),
      Password.createFromHash('hash'),
      'John',
      'Doe',
      true,
      [role],
    );

    userRepository.findById.mockResolvedValue(user);

    await expect(guard.canActivate(createContext({ sub: 'user-id' }))).rejects.toThrow(
      InsufficientPermissionsException,
    );
  });

  describe('API key scopes', () => {
    // Owner has full users:read AND users:delete permissions; the key's scopes must bound this.
    const buildOwner = () => {
      const role = new Role('r1', 'admin', 'Admin', false, [
        new Permission('p1', 'users', 'read', 'Read users'),
        new Permission('p2', 'users', 'delete', 'Delete users'),
      ]);
      return new User('user-id', Email.create('test@example.com'), Password.createFromHash('hash'), 'A', 'B', true, [
        role,
      ]);
    };

    it('should allow an API key whose scopes cover the required permission', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(['users:read']);
      userRepository.findById.mockResolvedValue(buildOwner());

      const ctx = createContext({ sub: 'user-id', isApiKey: true, scopes: ['users:read'] });
      expect(await guard.canActivate(ctx)).toBe(true);
    });

    it('should deny an API key lacking the scope even when the owner has the permission', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(['users:delete']);
      userRepository.findById.mockResolvedValue(buildOwner());

      // Key is scoped to users:read only — must NOT inherit the owner's users:delete.
      const ctx = createContext({ sub: 'user-id', isApiKey: true, scopes: ['users:read'] });
      await expect(guard.canActivate(ctx)).rejects.toThrow(InsufficientPermissionsException);
    });

    it('should honor a resource wildcard scope', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(['users:delete']);
      userRepository.findById.mockResolvedValue(buildOwner());

      const ctx = createContext({ sub: 'user-id', isApiKey: true, scopes: ['users:*'] });
      expect(await guard.canActivate(ctx)).toBe(true);
    });

    it('should deny an API key with empty scopes', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(['users:read']);
      userRepository.findById.mockResolvedValue(buildOwner());

      const ctx = createContext({ sub: 'user-id', isApiKey: true, scopes: [] });
      await expect(guard.canActivate(ctx)).rejects.toThrow(InsufficientPermissionsException);
    });
  });
});
