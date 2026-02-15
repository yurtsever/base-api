import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import type { AuthResponse } from '../dtos/auth-response.interface';

export interface RefreshTokenUseCasePort {
  execute(dto: RefreshTokenDto): Promise<AuthResponse>;
}

export const REFRESH_TOKEN_USE_CASE = Symbol('REFRESH_TOKEN_USE_CASE');
