import { RefreshToken } from '../models/refresh-token.model';

export interface RefreshTokenRepositoryPort {
  save(token: RefreshToken): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  revokeByToken(token: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
  rotateToken(oldTokenValue: string, newToken: RefreshToken): Promise<RefreshToken>;
}

export const REFRESH_TOKEN_REPOSITORY_PORT = Symbol('REFRESH_TOKEN_REPOSITORY_PORT');
