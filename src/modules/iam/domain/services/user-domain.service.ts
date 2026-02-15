import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult, PaginationOptions } from '../../../../shared/application/interfaces';
import type { UserRepositoryPort } from '../ports/user-repository.port';
import { USER_REPOSITORY_PORT } from '../ports/user-repository.port';
import { User } from '../models/user.model';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Injectable()
export class UserDomainService {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async getAllUsers(options?: PaginationOptions): Promise<PaginatedResult<User>> {
    return this.userRepository.findAll(options);
  }

  async updateUser(id: string, data: { firstName?: string; lastName?: string; isActive?: boolean }): Promise<User> {
    const user = await this.getUserById(id);

    const updatedUser = new User(
      user.id,
      user.email,
      user.password,
      data.firstName ?? user.firstName,
      data.lastName ?? user.lastName,
      data.isActive ?? user.isActive,
      user.roles,
      user.createdAt,
      new Date(),
    );

    return this.userRepository.update(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    await this.getUserById(id); // ensures exists
    await this.userRepository.delete(id);
  }
}
