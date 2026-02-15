export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
}

export interface TokenGeneratorPort {
  generateTokenPair(payload: AccessTokenPayload): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
  generateRefreshToken(): string;
}

export const TOKEN_GENERATOR_PORT = Symbol('TOKEN_GENERATOR_PORT');
