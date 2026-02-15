import { LoginDto } from '../dtos/login.dto';
import type { AuthResponse } from '../dtos/auth-response.interface';

export interface LoginUseCasePort {
  execute(dto: LoginDto): Promise<AuthResponse>;
}

export const LOGIN_USE_CASE = Symbol('LOGIN_USE_CASE');
