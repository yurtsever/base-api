import { Injectable } from '@nestjs/common';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import type { UpdateUserUseCasePort } from '../ports/update-user.use-case';

@Injectable()
export class UpdateUserUseCase implements UpdateUserUseCasePort {
  constructor(private readonly userDomainService: UserDomainService) {}

  async execute(id: string, dto: UpdateUserDto) {
    const user = await this.userDomainService.updateUser(id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: dto.isActive,
    });
    return user.toJSON();
  }
}
