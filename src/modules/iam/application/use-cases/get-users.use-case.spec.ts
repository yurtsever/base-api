import { Test, TestingModule } from '@nestjs/testing';
import { GetUsersUseCase } from './get-users.use-case';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';
import type { PaginatedResult } from '../../../../shared/application/interfaces';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;

  const mockUser = new User(
    'user-id',
    Email.create('test@example.com'),
    Password.createFromHash('hash'),
    'John',
    'Doe',
    true,
    [],
  );

  const mockPaginatedResult: PaginatedResult<User> = {
    items: [mockUser],
    meta: { total: 1, limit: 100, offset: 0, hasNext: false, hasPrev: false },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersUseCase,
        {
          provide: UserDomainService,
          useValue: { getAllUsers: jest.fn().mockResolvedValue(mockPaginatedResult) },
        },
      ],
    }).compile();

    useCase = module.get<GetUsersUseCase>(GetUsersUseCase);
  });

  it('should return paginated users as JSON', async () => {
    const result = await useCase.execute();
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toHaveProperty('id', 'user-id');
    expect(result.meta).toEqual({ total: 1, limit: 100, offset: 0, hasNext: false, hasPrev: false });
  });

  it('should pass pagination options through', async () => {
    const domainService = useCase['userDomainService'] as { getAllUsers: jest.Mock };
    await useCase.execute({ limit: 10, offset: 20 });
    expect(domainService.getAllUsers).toHaveBeenCalledWith({ limit: 10, offset: 20 });
  });
});
