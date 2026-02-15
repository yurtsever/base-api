import { Test, TestingModule } from '@nestjs/testing';
import { GetProfileUseCase } from './get-profile.use-case';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;

  const mockUser = new User(
    'user-id',
    Email.create('test@example.com'),
    Password.createFromHash('hash'),
    'John',
    'Doe',
    true,
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileUseCase,
        {
          provide: UserDomainService,
          useValue: { getUserById: jest.fn().mockResolvedValue(mockUser) },
        },
      ],
    }).compile();

    useCase = module.get<GetProfileUseCase>(GetProfileUseCase);
  });

  it('should return user profile as JSON', async () => {
    const result = await useCase.execute('user-id');
    expect(result).toHaveProperty('id', 'user-id');
    expect(result).toHaveProperty('email', 'test@example.com');
    expect(result).not.toHaveProperty('password');
  });
});
