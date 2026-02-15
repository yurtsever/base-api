import { IsEmail, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailRequestDto {
  @ApiProperty({ example: 'user@example.com', description: 'Recipient email or array of emails' })
  @IsEmail({}, { each: true })
  to!: string | string[];

  @ApiProperty({ example: 'Welcome!' })
  @IsString()
  subject!: string;

  @ApiPropertyOptional({ example: 'Hello, welcome to our platform.' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ example: '<p>Hello, welcome to our platform.</p>' })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ example: 'welcome', description: 'Handlebars template name' })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({ example: { name: 'John', loginUrl: 'https://example.com/login' } })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
