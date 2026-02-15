import { RegisterDto } from '../dtos/register.dto';
import type { AuthResponse } from '../dtos/auth-response.interface';

export interface RegisterUseCasePort {
  execute(dto: RegisterDto): Promise<AuthResponse>;
}

export const REGISTER_USE_CASE = Symbol('REGISTER_USE_CASE');
