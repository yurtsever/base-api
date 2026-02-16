import { OAuthAccount } from '../models/oauth-account.model';

export interface OAuthAccountRepositoryPort {
  save(account: OAuthAccount): Promise<OAuthAccount>;
  findByProviderAndProviderUserId(provider: string, providerUserId: string): Promise<OAuthAccount | null>;
  findAllByUserId(userId: string): Promise<OAuthAccount[]>;
  deleteByProviderAndUserId(provider: string, userId: string): Promise<void>;
}

export const OAUTH_ACCOUNT_REPOSITORY_PORT = Symbol('OAUTH_ACCOUNT_REPOSITORY_PORT');
