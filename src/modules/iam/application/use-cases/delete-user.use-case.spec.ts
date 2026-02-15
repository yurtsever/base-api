import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from './delete-user.use-case';
import { UserDomainService } from '../../domain/services/user-domain.service';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userDomainService: { deleteUser: jest.Mock };

  beforeEach(async () => {
    userDomainService = { deleteUser: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DeleteUserUseCase, { provide: UserDomainService, useValue: userDomainService }],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
  });

  it('should delete user', async () => {
    await useCase.execute('user-id');
    expect(userDomainService.deleteUser).toHaveBeenCalledWith('user-id');
  });
});
