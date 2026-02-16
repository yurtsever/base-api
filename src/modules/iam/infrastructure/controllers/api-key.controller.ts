import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateApiKeyDto } from '../../application/dtos/create-api-key.dto';
import type { CreateApiKeyUseCasePort } from '../../application/ports/create-api-key.use-case';
import { CREATE_API_KEY_USE_CASE } from '../../application/ports/create-api-key.use-case';
import type { ListApiKeysUseCasePort } from '../../application/ports/list-api-keys.use-case';
import { LIST_API_KEYS_USE_CASE } from '../../application/ports/list-api-keys.use-case';
import type { RevokeApiKeyUseCasePort } from '../../application/ports/revoke-api-key.use-case';
import { REVOKE_API_KEY_USE_CASE } from '../../application/ports/revoke-api-key.use-case';
import type { JwtPayload } from '../strategies/jwt.strategy';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth/api-keys')
export class ApiKeyController {
  constructor(
    @Inject(CREATE_API_KEY_USE_CASE)
    private readonly createApiKeyUseCase: CreateApiKeyUseCasePort,
    @Inject(LIST_API_KEYS_USE_CASE)
    private readonly listApiKeysUseCase: ListApiKeysUseCasePort,
    @Inject(REVOKE_API_KEY_USE_CASE)
    private readonly revokeApiKeyUseCase: RevokeApiKeyUseCasePort,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateApiKeyDto) {
    return this.createApiKeyUseCase.execute(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your API keys' })
  async list(@CurrentUser() user: JwtPayload) {
    return this.listApiKeysUseCase.execute(user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  async revoke(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const isAdmin = user.roles?.includes('admin') ?? false;
    await this.revokeApiKeyUseCase.execute(id, user.sub, isAdmin);
    return { message: 'API key revoked successfully' };
  }
}
