import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'The refresh token (optional when sent via cookie)' })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
