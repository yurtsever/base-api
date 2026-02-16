export interface ApiKeyHasherPort {
  hash(rawKey: string): string;
  generateKey(): { raw: string; hash: string; prefix: string };
}

export const API_KEY_HASHER_PORT = Symbol('API_KEY_HASHER_PORT');
