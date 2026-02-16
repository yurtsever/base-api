import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { ApiKeyRepositoryPort } from '../../domain/ports/api-key-repository.port';
import { API_KEY_REPOSITORY_PORT } from '../../domain/ports/api-key-repository.port';
import type { ApiKeyHasherPort } from '../../domain/ports/api-key-hasher.port';
import { API_KEY_HASHER_PORT } from '../../domain/ports/api-key-hasher.port';
import type { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/user-repository.port';
import { InvalidApiKeyException } from '../../domain/exceptions/invalid-api-key.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject(API_KEY_REPOSITORY_PORT)
    private readonly apiKeyRepository: ApiKeyRepositoryPort,
    @Inject(API_KEY_HASHER_PORT)
    private readonly apiKeyHasher: ApiKeyHasherPort,
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyHeader = request.headers['x-api-key'] as string | undefined;

    if (apiKeyHeader) {
      return this.validateApiKey(apiKeyHeader, request);
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  private async validateApiKey(rawKey: string, request: Request): Promise<boolean> {
    const keyHash = this.apiKeyHasher.hash(rawKey);
    const apiKey = await this.apiKeyRepository.findByKeyHash(keyHash);

    if (!apiKey || !apiKey.isValid()) {
      throw new InvalidApiKeyException();
    }

    const user = await this.userRepository.findById(apiKey.userId);
    if (!user || !user.isActive) {
      throw new InvalidApiKeyException();
    }

    (request as unknown as Record<string, unknown>).user = {
      sub: apiKey.userId,
      email: user.email.value,
      roles: [] as string[],
      scopes: apiKey.scopes,
      isApiKey: true,
    };

    // Fire-and-forget: update lastUsedAt without blocking the request
    this.apiKeyRepository.updateLastUsed(apiKey.id).catch(() => {});

    return true;
  }
}
