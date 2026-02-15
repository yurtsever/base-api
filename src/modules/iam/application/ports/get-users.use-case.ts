import type { PaginatedResult, PaginationOptions } from '../../../../shared/application/interfaces';
import type { UserJson } from '../dtos/auth-response.interface';

export interface GetUsersUseCasePort {
  execute(options?: PaginationOptions): Promise<PaginatedResult<UserJson>>;
}

export const GET_USERS_USE_CASE = Symbol('GET_USERS_USE_CASE');
