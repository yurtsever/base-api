import type { PaginatedResult, PaginationOptions } from '../../../../shared/application/interfaces';
import { User } from '../models/user.model';

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(options?: PaginationOptions): Promise<PaginatedResult<User>>;
}

export const USER_REPOSITORY_PORT = Symbol('USER_REPOSITORY_PORT');
