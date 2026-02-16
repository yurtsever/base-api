import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OAuthProviderAdapter } from './oauth-provider.adapter';
import { OAuthException } from '../../domain/exceptions/oauth.exception';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('OAuthProviderAdapter', () => {
  let adapter: OAuthProviderAdapter;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          'oauth.google.clientId': 'google-client-id',
          'oauth.google.clientSecret': 'google-client-secret',
          'oauth.github.clientId': 'github-client-id',
          'oauth.github.clientSecret': 'github-client-secret',
        };
        return config[key] || '';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OAuthProviderAdapter, { provide: ConfigService, useValue: configService }],
    }).compile();

    adapter = module.get<OAuthProviderAdapter>(OAuthProviderAdapter);
    mockFetch.mockReset();
  });

  describe('getProfile - Google', () => {
    it('should exchange code and return profile', async () => {
      // Token exchange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'google-access-token' }),
      });
      // User info
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'goog-123',
            email: 'user@gmail.com',
            given_name: 'John',
            family_name: 'Doe',
          }),
      });

      const profile = await adapter.getProfile('google', 'auth-code', 'http://localhost:3000/callback');

      expect(profile).toEqual({
        providerUserId: 'goog-123',
        email: 'user@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw when token exchange fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(adapter.getProfile('google', 'bad-code', 'http://localhost:3000/callback')).rejects.toThrow(
        OAuthException,
      );
    });

    it('should throw when no access token returned', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await expect(adapter.getProfile('google', 'code', 'http://localhost:3000/callback')).rejects.toThrow(
        OAuthException,
      );
    });

    it('should throw when user info fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'token' }),
      });
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(adapter.getProfile('google', 'code', 'http://localhost:3000/callback')).rejects.toThrow(
        OAuthException,
      );
    });

    it('should throw when Google is not configured', async () => {
      configService.get.mockReturnValue('');

      await expect(adapter.getProfile('google', 'code', 'http://localhost:3000/callback')).rejects.toThrow(
        OAuthException,
      );
    });
  });

  describe('getProfile - GitHub', () => {
    it('should exchange code and return profile', async () => {
      // Token exchange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'gh-access-token' }),
      });
      // User info
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 12345,
            email: 'user@github.com',
            name: 'Jane Smith',
            login: 'janesmith',
          }),
      });

      const profile = await adapter.getProfile('github', 'auth-code', 'http://localhost:3000/callback');

      expect(profile).toEqual({
        providerUserId: '12345',
        email: 'user@github.com',
        firstName: 'Jane',
        lastName: 'Smith',
      });
    });

    it('should fetch email from /user/emails when not in profile', async () => {
      // Token exchange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'gh-access-token' }),
      });
      // User info (no email)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 12345,
            email: null,
            name: 'Jane',
            login: 'janesmith',
          }),
      });
      // User emails
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { email: 'secondary@example.com', primary: false, verified: true },
            { email: 'primary@example.com', primary: true, verified: true },
          ]),
      });

      const profile = await adapter.getProfile('github', 'auth-code', 'http://localhost:3000/callback');

      expect(profile.email).toBe('primary@example.com');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should throw when token exchange returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ error: 'bad_verification_code' }),
      });

      await expect(adapter.getProfile('github', 'bad-code', 'http://localhost:3000/callback')).rejects.toThrow(
        OAuthException,
      );
    });

    it('should throw when no email available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'gh-token' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 12345, email: null, name: 'Jane' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await expect(adapter.getProfile('github', 'code', 'http://localhost:3000/callback')).rejects.toThrow(
        OAuthException,
      );
    });
  });

  describe('getProfile - unsupported provider', () => {
    it('should throw for unsupported provider', async () => {
      await expect(adapter.getProfile('facebook', 'code', 'http://localhost:3000/callback')).rejects.toThrow(
        OAuthException,
      );
    });
  });
});
