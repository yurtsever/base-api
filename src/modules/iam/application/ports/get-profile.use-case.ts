import type { UserJson } from '../dtos/auth-response.interface';

export interface GetProfileUseCasePort {
  execute(userId: string): Promise<UserJson>;
}

export const GET_PROFILE_USE_CASE = Symbol('GET_PROFILE_USE_CASE');
