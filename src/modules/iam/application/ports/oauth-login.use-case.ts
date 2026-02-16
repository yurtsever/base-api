import { OAuthCallbackDto } from '../dtos/oauth-callback.dto';
import type { AuthResponse } from '../dtos/auth-response.interface';

export interface OAuthLoginUseCasePort {
  execute(dto: OAuthCallbackDto): Promise<AuthResponse & { isNewUser: boolean }>;
}

export const OAUTH_LOGIN_USE_CASE = Symbol('OAUTH_LOGIN_USE_CASE');
