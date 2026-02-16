export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
}

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  ssl: boolean;
  maxConnections: number;
  minConnections: number;
}

export interface LoggingConfig {
  level: string;
  prettyPrint: boolean;
}

export interface SecurityConfig {
  corsOrigins: string[];
  rateLimitTtl: number;
  rateLimitMax: number;
}

export interface AuthConfig {
  jwt: {
    secret: string;
    accessExpiration: number;
    refreshExpiration: number;
  };
  bcryptSaltRounds: number;
}

export interface CookieConfig {
  domain: string;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

export interface AuditConfig {
  retentionDays: number;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  defaultFrom: string;
}

export interface OtpConfig {
  expiration: number;
  maxAttempts: number;
  resendInterval: number;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  logging: LoggingConfig;
  security: SecurityConfig;
  auth: AuthConfig;
  cookie: CookieConfig;
  audit: AuditConfig;
  email: EmailConfig;
  otp: OtpConfig;
}

export default (): Configuration => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api',
  },
  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'base_api',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    logging: process.env.DATABASE_LOGGING === 'true',
    ssl: process.env.DATABASE_SSL === 'true',
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10', 10),
    minConnections: parseInt(process.env.DATABASE_MIN_CONNECTIONS || '2', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production',
  },
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'default-dev-secret-change-me',
      accessExpiration: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900', 10),
      refreshExpiration: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800', 10),
    },
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },
  cookie: {
    domain: process.env.COOKIE_DOMAIN || '',
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'strict',
  },
  audit: {
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '90', 10),
  },
  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    defaultFrom: process.env.SMTP_DEFAULT_FROM || 'noreply@localhost',
  },
  otp: {
    expiration: parseInt(process.env.OTP_EXPIRATION || '300', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
    resendInterval: parseInt(process.env.OTP_RESEND_INTERVAL || '60', 10),
  },
});
