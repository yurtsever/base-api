import { Otp } from '../models/otp.model';

export interface OtpRepositoryPort {
  save(otp: Otp): Promise<Otp>;
  findLatestByEmail(email: string): Promise<Otp | null>;
  invalidateAllByEmail(email: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export const OTP_REPOSITORY_PORT = Symbol('OTP_REPOSITORY_PORT');
