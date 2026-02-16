import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { GET_PROFILE_USE_CASE } from '../../application/ports/get-profile.use-case';
import { GET_USERS_USE_CASE } from '../../application/ports/get-users.use-case';
import { UPDATE_USER_USE_CASE } from '../../application/ports/update-user.use-case';
import { DELETE_USER_USE_CASE } from '../../application/ports/delete-user.use-case';
import { LIST_API_KEYS_USE_CASE } from '../../application/ports/list-api-keys.use-case';
import { REVOKE_API_KEY_USE_CASE } from '../../application/ports/revoke-api-key.use-case';

describe('UserController', () => {
  let controller: UserController;
  let getProfileUseCase: { execute: jest.Mock };
  let getUsersUseCase: { execute: jest.Mock };
  let updateUserUseCase: { execute: jest.Mock };
  let deleteUserUseCase: { execute: jest.Mock };
  let listApiKeysUseCase: { execute: jest.Mock };
  let revokeApiKeyUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    getProfileUseCase = { execute: jest.fn() };
    getUsersUseCase = { execute: jest.fn() };
    updateUserUseCase = { execute: jest.fn() };
    deleteUserUseCase = { execute: jest.fn() };
    listApiKeysUseCase = { execute: jest.fn() };
    revokeApiKeyUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: GET_PROFILE_USE_CASE, useValue: getProfileUseCase },
        { provide: GET_USERS_USE_CASE, useValue: getUsersUseCase },
        { provide: UPDATE_USER_USE_CASE, useValue: updateUserUseCase },
        { provide: DELETE_USER_USE_CASE, useValue: deleteUserUseCase },
        { provide: LIST_API_KEYS_USE_CASE, useValue: listApiKeysUseCase },
        { provide: REVOKE_API_KEY_USE_CASE, useValue: revokeApiKeyUseCase },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const expected = { id: 'user-id', email: 'test@example.com' };
      getProfileUseCase.execute.mockResolvedValue(expected);

      const result = await controller.getProfile({ sub: 'user-id', email: 'test@example.com', roles: ['user'] });

      expect(result).toBe(expected);
      expect(getProfileUseCase.execute).toHaveBeenCalledWith('user-id');
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const expected = {
        items: [{ id: 'user-id' }],
        meta: { total: 1, limit: 100, offset: 0, hasNext: false, hasPrev: false },
      };
      getUsersUseCase.execute.mockResolvedValue(expected);

      const result = await controller.getUsers({});

      expect(result).toBe(expected);
      expect(getUsersUseCase.execute).toHaveBeenCalledWith({ limit: undefined, offset: undefined });
    });

    it('should pass pagination params to use case', async () => {
      const expected = {
        items: [{ id: 'user-id' }],
        meta: { total: 1, limit: 10, offset: 20, hasNext: false, hasPrev: false },
      };
      getUsersUseCase.execute.mockResolvedValue(expected);

      const result = await controller.getUsers({ limit: 10, offset: 20 });

      expect(result).toBe(expected);
      expect(getUsersUseCase.execute).toHaveBeenCalledWith({ limit: 10, offset: 20 });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const expected = { id: 'user-id' };
      getProfileUseCase.execute.mockResolvedValue(expected);

      const result = await controller.getUserById('user-id');

      expect(result).toBe(expected);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const expected = { id: 'user-id', firstName: 'Jane' };
      updateUserUseCase.execute.mockResolvedValue(expected);

      const result = await controller.updateUser('user-id', { firstName: 'Jane' });

      expect(result).toBe(expected);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      deleteUserUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.deleteUser('user-id');

      expect(result).toEqual({ message: 'User deleted successfully' });
    });
  });
});
