import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'CI Pipeline' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: ['users:read', 'audit:read'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  scopes!: string[];

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
