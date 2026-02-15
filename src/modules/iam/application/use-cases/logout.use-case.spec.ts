import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase } from './logout.use-case';
import { AuthDomainService } from '../../domain/services/auth-domain.service';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let authDomainService: { logout: jest.Mock };

  beforeEach(async () => {
    authDomainService = { logout: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LogoutUseCase, { provide: AuthDomainService, useValue: authDomainService }],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  it('should call logout on domain service', async () => {
    await useCase.execute({ refreshToken: 'token-value' });
    expect(authDomainService.logout).toHaveBeenCalledWith('token-value');
  });
});
