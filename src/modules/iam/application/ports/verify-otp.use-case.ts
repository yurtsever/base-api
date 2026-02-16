import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import type { AuthResponse } from '../dtos/auth-response.interface';

export interface VerifyOtpUseCasePort {
  execute(dto: VerifyOtpDto): Promise<AuthResponse>;
}

export const VERIFY_OTP_USE_CASE = Symbol('VERIFY_OTP_USE_CASE');
