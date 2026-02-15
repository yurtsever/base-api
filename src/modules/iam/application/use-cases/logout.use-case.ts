import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import type { LogoutUseCasePort } from '../ports/logout.use-case';

@Injectable()
export class LogoutUseCase implements LogoutUseCasePort {
  constructor(private readonly authDomainService: AuthDomainService) {}

  async execute(dto: RefreshTokenDto): Promise<void> {
    if (!dto.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    await this.authDomainService.logout(dto.refreshToken);
  }
}
