import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OAuthProviderPort, OAuthUserProfile } from '../../domain/ports/oauth-provider.port';
import { OAuthException } from '../../domain/exceptions/oauth.exception';

@Injectable()
export class OAuthProviderAdapter implements OAuthProviderPort {
  constructor(private readonly configService: ConfigService) {}

  async getProfile(provider: string, code: string, redirectUri: string): Promise<OAuthUserProfile> {
    switch (provider) {
      case 'google':
        return this.getGoogleProfile(code, redirectUri);
      case 'github':
        return this.getGitHubProfile(code, redirectUri);
      default:
        throw new OAuthException(`Unsupported OAuth provider: ${provider}`);
    }
  }

  private async getGoogleProfile(code: string, redirectUri: string): Promise<OAuthUserProfile> {
    const clientId = this.configService.get<string>('oauth.google.clientId');
    const clientSecret = this.configService.get<string>('oauth.google.clientSecret');

    if (!clientId || !clientSecret) {
      throw new OAuthException('Google OAuth is not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new OAuthException('Failed to exchange Google authorization code');
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string };
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      throw new OAuthException('Google did not return an access token');
    }

    // Fetch user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      throw new OAuthException('Failed to fetch Google user profile');
    }

    const profile = (await userResponse.json()) as {
      id?: string;
      email?: string;
      verified_email?: boolean;
      given_name?: string;
      family_name?: string;
    };

    if (!profile.id || !profile.email) {
      throw new OAuthException('Google profile is missing required fields');
    }

    return {
      providerUserId: profile.id,
      email: profile.email,
      emailVerified: profile.verified_email === true,
      firstName: profile.given_name || '',
      lastName: profile.family_name || '',
    };
  }

  private async getGitHubProfile(code: string, redirectUri: string): Promise<OAuthUserProfile> {
    const clientId = this.configService.get<string>('oauth.github.clientId');
    const clientSecret = this.configService.get<string>('oauth.github.clientSecret');

    if (!clientId || !clientSecret) {
      throw new OAuthException('GitHub OAuth is not configured');
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new OAuthException('Failed to exchange GitHub authorization code');
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string };
    if (tokenData.error || !tokenData.access_token) {
      throw new OAuthException(tokenData.error || 'GitHub did not return an access token');
    }

    const accessToken = tokenData.access_token;

    // Fetch user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!userResponse.ok) {
      throw new OAuthException('Failed to fetch GitHub user profile');
    }

    const profile = (await userResponse.json()) as {
      id?: number;
      name?: string;
      login?: string;
    };

    if (!profile.id) {
      throw new OAuthException('GitHub profile is missing required fields');
    }

    // The /user `email` field carries no verification status, so it cannot be trusted.
    // Always resolve the address (and its verified flag) from the authoritative /user/emails endpoint.
    const resolved = await this.getGitHubEmail(accessToken);
    if (!resolved.email) {
      throw new OAuthException('Could not retrieve an email address from GitHub');
    }

    // Split name into first/last
    const nameParts = (profile.name || profile.login || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      providerUserId: String(profile.id),
      email: resolved.email,
      emailVerified: resolved.verified,
      firstName,
      lastName,
    };
  }

  private async getGitHubEmail(accessToken: string): Promise<{ email: string | null; verified: boolean }> {
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!emailResponse.ok) {
      // Detail (status/body) is intentionally not surfaced to the client; the generic
      // OAuthException upstream avoids leaking the user's email set or provider internals.
      return { email: null, verified: false };
    }

    const emails = (await emailResponse.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;

    if (!emails || emails.length === 0) {
      return { email: null, verified: false };
    }

    // Prefer the primary verified address, then any verified address.
    const primaryVerified = emails.find((e) => e.primary && e.verified);
    if (primaryVerified) return { email: primaryVerified.email, verified: true };

    const anyVerified = emails.find((e) => e.verified);
    if (anyVerified) return { email: anyVerified.email, verified: true };

    // No verified address. Surface the primary (or first) address but flag it unverified
    // so the domain layer refuses to find-or-create an account from it.
    const primary = emails.find((e) => e.primary) ?? emails[0];
    return { email: primary?.email ?? null, verified: false };
  }
}
