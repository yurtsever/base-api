import { Injectable } from '@nestjs/common';
import type { PaginatedResult, PaginationOptions } from '../../../../shared/application/interfaces';
import { UserDomainService } from '../../domain/services/user-domain.service';
import type { GetUsersUseCasePort } from '../ports/get-users.use-case';
import type { UserJson } from '../dtos/auth-response.interface';

@Injectable()
export class GetUsersUseCase implements GetUsersUseCasePort {
  constructor(private readonly userDomainService: UserDomainService) {}

  async execute(options?: PaginationOptions): Promise<PaginatedResult<UserJson>> {
    const result = await this.userDomainService.getAllUsers(options);
    return {
      items: result.items.map((u) => u.toJSON()),
      meta: result.meta,
    };
  }
}
