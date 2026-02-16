import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import type { ApiKeyHasherPort } from '../../domain/ports/api-key-hasher.port';

const KEY_PREFIX = 'bak_';
const RANDOM_BYTES = 48;

@Injectable()
export class Sha256ApiKeyHasherAdapter implements ApiKeyHasherPort {
  hash(rawKey: string): string {
    return createHash('sha256').update(rawKey).digest('hex');
  }

  generateKey(): { raw: string; hash: string; prefix: string } {
    const randomHex = randomBytes(RANDOM_BYTES).toString('hex');
    const raw = `${KEY_PREFIX}${randomHex}`;
    const hash = this.hash(raw);
    const prefix = raw.substring(0, 12);

    return { raw, hash, prefix };
  }
}
