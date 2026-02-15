import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './update-user.use-case';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;

  const updatedUser = new User(
    'user-id',
    Email.create('test@example.com'),
    Password.createFromHash('hash'),
    'Jane',
    'Doe',
    true,
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: UserDomainService,
          useValue: { updateUser: jest.fn().mockResolvedValue(updatedUser) },
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  it('should update user and return JSON', async () => {
    const result = await useCase.execute('user-id', { firstName: 'Jane' });
    expect(result).toHaveProperty('firstName', 'Jane');
  });
});
