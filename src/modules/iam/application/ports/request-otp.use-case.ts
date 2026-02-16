import { RequestOtpDto } from '../dtos/request-otp.dto';

export interface RequestOtpUseCasePort {
  execute(dto: RequestOtpDto): Promise<{ message: string }>;
}

export const REQUEST_OTP_USE_CASE = Symbol('REQUEST_OTP_USE_CASE');
