import { LinkOAuthAccountDto } from '../dtos/link-oauth-account.dto';

export interface LinkedOAuthAccount {
  provider: string;
  providerUserId: string;
  email: string;
}

export interface LinkOAuthAccountUseCasePort {
  execute(userId: string, dto: LinkOAuthAccountDto): Promise<LinkedOAuthAccount>;
}

export const LINK_OAUTH_ACCOUNT_USE_CASE = Symbol('LINK_OAUTH_ACCOUNT_USE_CASE');
