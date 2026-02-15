import { Test, TestingModule } from '@nestjs/testing';
import { UserDomainService } from './user-domain.service';
import type { UserRepositoryPort } from '../ports/user-repository.port';
import { USER_REPOSITORY_PORT } from '../ports/user-repository.port';
import { User } from '../models/user.model';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

describe('UserDomainService', () => {
  let service: UserDomainService;
  let userRepository: jest.Mocked<UserRepositoryPort>;

  const mockUser = new User(
    'user-id',
    Email.create('test@example.com'),
    Password.createFromHash('hashed-password'),
    'John',
    'Doe',
    true,
    [],
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as jest.Mocked<UserRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDomainService, { provide: USER_REPOSITORY_PORT, useValue: userRepository }],
    }).compile();

    service = module.get<UserDomainService>(UserDomainService);
  });

  describe('getUserById', () => {
    it('should return user', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-id');
      expect(result).toBe(mockUser);
    });

    it('should throw if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getUserById('nonexistent')).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const paginatedResult = {
        items: [mockUser],
        meta: { total: 1, limit: 100, offset: 0, hasNext: false, hasPrev: false },
      };
      userRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await service.getAllUsers();
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockImplementation((user: User) => Promise.resolve(user));

      const result = await service.updateUser('user-id', { firstName: 'Jane' });

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Doe'); // unchanged
      expect(userRepository.update).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.updateUser('nonexistent', { firstName: 'Jane' })).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);

      await service.deleteUser('user-id');
      expect(userRepository.delete).toHaveBeenCalledWith('user-id');
    });

    it('should throw if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.deleteUser('nonexistent')).rejects.toThrow(UserNotFoundException);
    });
  });
});
