import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtTokenGeneratorAdapter } from './jwt-token-generator.adapter';

describe('JwtTokenGeneratorAdapter', () => {
  let adapter: JwtTokenGeneratorAdapter;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-jwt-token'),
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-id', email: 'test@example.com', roles: ['user'] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenGeneratorAdapter,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(900) } },
      ],
    }).compile();

    adapter = module.get<JwtTokenGeneratorAdapter>(JwtTokenGeneratorAdapter);
  });

  describe('generateTokenPair', () => {
    it('should generate access token and opaque refresh token', async () => {
      const result = await adapter.generateTokenPair({
        sub: 'user-id',
        email: 'test@example.com',
        roles: ['user'],
      });

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken.length).toBeGreaterThan(0);
      expect(result.expiresIn).toBe(900);
      expect(jwtService.signAsync).toHaveBeenCalled();
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and return payload', async () => {
      const result = await adapter.verifyAccessToken('some-token');

      expect(result.sub).toBe('user-id');
      expect(result.email).toBe('test@example.com');
      expect(result.roles).toEqual(['user']);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate an opaque token', () => {
      const token = adapter.generateRefreshToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(128); // 64 bytes * 2 hex chars
    });
  });
});
