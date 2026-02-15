import { Injectable } from '@nestjs/common';
import { UserDomainService } from '../../domain/services/user-domain.service';
import type { DeleteUserUseCasePort } from '../ports/delete-user.use-case';

@Injectable()
export class DeleteUserUseCase implements DeleteUserUseCasePort {
  constructor(private readonly userDomainService: UserDomainService) {}

  async execute(id: string): Promise<void> {
    await this.userDomainService.deleteUser(id);
  }
}
