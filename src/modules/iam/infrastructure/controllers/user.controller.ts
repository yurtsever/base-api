import { Body, Controller, Delete, Get, Inject, Param, Patch, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import type { GetProfileUseCasePort } from '../../application/ports/get-profile.use-case';
import { GET_PROFILE_USE_CASE } from '../../application/ports/get-profile.use-case';
import type { GetUsersUseCasePort } from '../../application/ports/get-users.use-case';
import { GET_USERS_USE_CASE } from '../../application/ports/get-users.use-case';
import type { UpdateUserUseCasePort } from '../../application/ports/update-user.use-case';
import { UPDATE_USER_USE_CASE } from '../../application/ports/update-user.use-case';
import type { DeleteUserUseCasePort } from '../../application/ports/delete-user.use-case';
import { DELETE_USER_USE_CASE } from '../../application/ports/delete-user.use-case';
import type { ListApiKeysUseCasePort } from '../../application/ports/list-api-keys.use-case';
import { LIST_API_KEYS_USE_CASE } from '../../application/ports/list-api-keys.use-case';
import type { RevokeApiKeyUseCasePort } from '../../application/ports/revoke-api-key.use-case';
import { REVOKE_API_KEY_USE_CASE } from '../../application/ports/revoke-api-key.use-case';
import { PaginationQueryDto } from '../../../../shared/application/dtos';
import type { JwtPayload } from '../strategies/jwt.strategy';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    @Inject(GET_PROFILE_USE_CASE)
    private readonly getProfileUseCase: GetProfileUseCasePort,
    @Inject(GET_USERS_USE_CASE)
    private readonly getUsersUseCase: GetUsersUseCasePort,
    @Inject(UPDATE_USER_USE_CASE)
    private readonly updateUserUseCase: UpdateUserUseCasePort,
    @Inject(DELETE_USER_USE_CASE)
    private readonly deleteUserUseCase: DeleteUserUseCasePort,
    @Inject(LIST_API_KEYS_USE_CASE)
    private readonly listApiKeysUseCase: ListApiKeysUseCasePort,
    @Inject(REVOKE_API_KEY_USE_CASE)
    private readonly revokeApiKeyUseCase: RevokeApiKeyUseCasePort,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.getProfileUseCase.execute(user.sub);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async getUsers(@Query() query: PaginationQueryDto) {
    return this.getUsersUseCase.execute({ limit: query.limit, offset: query.offset });
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.getProfileUseCase.execute(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user (admin only)' })
  async updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUserUseCase.execute(id);
    return { message: 'User deleted successfully' };
  }

  @Get(':userId/api-keys')
  @Roles('admin')
  @ApiOperation({ summary: "List a user's API keys (admin only)" })
  async getUserApiKeys(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.listApiKeysUseCase.execute(userId);
  }

  @Delete(':userId/api-keys/:apiKeyId')
  @Roles('admin')
  @ApiOperation({ summary: "Revoke a user's API key (admin only)" })
  async revokeUserApiKey(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('apiKeyId', ParseUUIDPipe) apiKeyId: string,
  ) {
    await this.revokeApiKeyUseCase.execute(apiKeyId, userId, true);
    return { message: 'API key revoked successfully' };
  }
}
