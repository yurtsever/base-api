import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BcryptPasswordHasherAdapter } from './bcrypt-password-hasher.adapter';

describe('BcryptPasswordHasherAdapter', () => {
  let adapter: BcryptPasswordHasherAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BcryptPasswordHasherAdapter,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(4) }, // low salt rounds for fast tests
        },
      ],
    }).compile();

    adapter = module.get<BcryptPasswordHasherAdapter>(BcryptPasswordHasherAdapter);
  });

  it('should hash a password', async () => {
    const hash = await adapter.hash('StrongP@ss1');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('StrongP@ss1');
  });

  it('should compare password with hash correctly', async () => {
    const hash = await adapter.hash('StrongP@ss1');
    const isMatch = await adapter.compare('StrongP@ss1', hash);
    expect(isMatch).toBe(true);
  });

  it('should return false for wrong password', async () => {
    const hash = await adapter.hash('StrongP@ss1');
    const isMatch = await adapter.compare('WrongP@ss1', hash);
    expect(isMatch).toBe(false);
  });
});
