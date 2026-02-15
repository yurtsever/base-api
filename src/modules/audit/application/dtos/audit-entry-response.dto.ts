import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditEntryResponseDto {
  @ApiProperty({ description: 'Unique audit entry ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ description: 'Action performed', example: 'HTTP_REQUEST' })
  action!: string;

  @ApiProperty({ description: 'Resource accessed', example: 'users' })
  resource!: string;

  @ApiPropertyOptional({ description: 'ID of the specific resource', example: '550e8400-e29b-41d4-a716-446655440000' })
  resourceId?: string;

  @ApiPropertyOptional({ description: 'ID of the user who performed the action' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Email of the user who performed the action' })
  userEmail?: string;

  @ApiProperty({ description: 'IP address of the request', example: '127.0.0.1' })
  ipAddress!: string;

  @ApiProperty({ description: 'HTTP method', example: 'GET' })
  method!: string;

  @ApiProperty({ description: 'Request path', example: '/api/users' })
  path!: string;

  @ApiProperty({ description: 'HTTP response status code', example: 200 })
  statusCode!: number;

  @ApiPropertyOptional({ description: 'Additional metadata', type: 'object', additionalProperties: true })
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: 'Request duration in milliseconds', example: 150 })
  duration!: number;

  @ApiProperty({ description: 'Timestamp of the audit entry', example: '2025-01-01T00:00:00.000Z' })
  createdAt!: string;
}
