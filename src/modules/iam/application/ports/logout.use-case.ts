import { RefreshTokenDto } from '../dtos/refresh-token.dto';

export interface LogoutUseCasePort {
  execute(dto: RefreshTokenDto): Promise<void>;
}

export const LOGOUT_USE_CASE = Symbol('LOGOUT_USE_CASE');
