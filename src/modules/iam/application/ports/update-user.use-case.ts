import { UpdateUserDto } from '../dtos/update-user.dto';
import type { UserJson } from '../dtos/auth-response.interface';

export interface UpdateUserUseCasePort {
  execute(id: string, dto: UpdateUserDto): Promise<UserJson>;
}

export const UPDATE_USER_USE_CASE = Symbol('UPDATE_USER_USE_CASE');
