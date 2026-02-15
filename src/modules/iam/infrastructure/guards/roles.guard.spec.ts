import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createContext = (user: Record<string, unknown> | null = null): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('should return true for public routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('should return true when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(null);

    expect(guard.canActivate(createContext({ roles: ['user'] }))).toBe(true);
  });

  it('should allow user with required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(['admin']);

    expect(guard.canActivate(createContext({ roles: ['admin', 'user'] }))).toBe(true);
  });

  it('should deny user without required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(['admin']);

    expect(() => guard.canActivate(createContext({ roles: ['user'] }))).toThrow(InsufficientPermissionsException);
  });

  it('should deny when no user on request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(['admin']);

    expect(() => guard.canActivate(createContext(null))).toThrow(InsufficientPermissionsException);
  });
});
