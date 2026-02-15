import configuration from './configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default configuration', () => {
    const config = configuration();

    expect(config).toHaveProperty('app');
    expect(config).toHaveProperty('database');
    expect(config).toHaveProperty('logging');
    expect(config).toHaveProperty('security');
  });

  it('should use environment variables when provided', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4000';
    process.env.DATABASE_HOST = 'db.example.com';

    const config = configuration();

    expect(config.app.nodeEnv).toBe('production');
    expect(config.app.port).toBe(4000);
    expect(config.database.host).toBe('db.example.com');
  });

  it('should parse CORS origins from comma-separated string', () => {
    process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:4200';

    const config = configuration();

    expect(config.security.corsOrigins).toEqual(['http://localhost:3000', 'http://localhost:4200']);
  });

  it('should handle boolean environment variables', () => {
    process.env.DATABASE_SYNCHRONIZE = 'true';
    process.env.DATABASE_LOGGING = 'true';
    process.env.DATABASE_SSL = 'true';

    const config = configuration();

    expect(config.database.synchronize).toBe(true);
    expect(config.database.logging).toBe(true);
    expect(config.database.ssl).toBe(true);
  });
});
