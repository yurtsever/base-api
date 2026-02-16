import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, validateSync, Min, Max } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api';

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  DATABASE_HOST: string = 'localhost';

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  DATABASE_PORT: number = 5432;

  @IsString()
  @IsOptional()
  DATABASE_USERNAME: string = 'postgres';

  @IsString()
  @IsOptional()
  DATABASE_PASSWORD: string = 'postgres';

  @IsString()
  @IsOptional()
  DATABASE_NAME: string = 'base_api';

  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE: boolean = false;

  @IsBoolean()
  @IsOptional()
  DATABASE_LOGGING: boolean = false;

  @IsBoolean()
  @IsOptional()
  DATABASE_SSL: boolean = false;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  DATABASE_MAX_CONNECTIONS: number = 10;

  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  DATABASE_MIN_CONNECTIONS: number = 2;

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = 'info';

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsNumber()
  @Min(1000)
  @IsOptional()
  RATE_LIMIT_TTL: number = 60000;

  @IsNumber()
  @Min(1)
  @IsOptional()
  RATE_LIMIT_MAX: number = 10;

  @IsString()
  @IsOptional()
  JWT_SECRET: string = 'default-dev-secret-change-me';

  @IsNumber()
  @Min(60)
  @IsOptional()
  JWT_ACCESS_EXPIRATION: number = 900;

  @IsNumber()
  @Min(60)
  @IsOptional()
  JWT_REFRESH_EXPIRATION: number = 604800;

  @IsNumber()
  @Min(4)
  @Max(16)
  @IsOptional()
  BCRYPT_SALT_ROUNDS: number = 12;

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN: string = '';

  @IsBoolean()
  @IsOptional()
  COOKIE_SECURE: boolean = false;

  @IsString()
  @IsOptional()
  COOKIE_SAME_SITE: string = 'strict';

  @IsNumber()
  @Min(1)
  @IsOptional()
  AUDIT_RETENTION_DAYS: number = 90;

  @IsString()
  @IsOptional()
  SMTP_HOST: string = 'localhost';

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  SMTP_PORT: number = 1025;

  @IsBoolean()
  @IsOptional()
  SMTP_SECURE: boolean = false;

  @IsString()
  @IsOptional()
  SMTP_USER: string = '';

  @IsString()
  @IsOptional()
  SMTP_PASSWORD: string = '';

  @IsString()
  @IsOptional()
  SMTP_DEFAULT_FROM: string = 'noreply@localhost';

  @IsNumber()
  @Min(60)
  @IsOptional()
  OTP_EXPIRATION: number = 300;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  OTP_MAX_ATTEMPTS: number = 5;

  @IsNumber()
  @Min(10)
  @IsOptional()
  OTP_RESEND_INTERVAL: number = 60;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((err) => Object.values(err.constraints || {}).join(', ')).join('\n')}`,
    );
  }

  return validatedConfig;
}
