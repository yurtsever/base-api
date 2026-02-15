import { Injectable } from '@nestjs/common';
import { UserDomainService } from '../../domain/services/user-domain.service';
import type { GetProfileUseCasePort } from '../ports/get-profile.use-case';

@Injectable()
export class GetProfileUseCase implements GetProfileUseCasePort {
  constructor(private readonly userDomainService: UserDomainService) {}

  async execute(userId: string) {
    const user = await this.userDomainService.getUserById(userId);
    return user.toJSON();
  }
}
