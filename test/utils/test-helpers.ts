import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';

export class MockConfigService {
  private config: Map<string, any> = new Map();

  constructor(initialConfig: Record<string, any> = {}) {
    Object.entries(initialConfig).forEach(([key, value]) => {
      this.config.set(key, value);
    });
  }

  get<T = any>(key: string, defaultValue?: T): T {
    return (this.config.has(key) ? this.config.get(key) : defaultValue) as T;
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }
}

export class MockLogger extends PinoLogger {
  log = jest.fn();
  error = jest.fn();
  warn = jest.fn();
  debug = jest.fn();
  verbose = jest.fn();
  info = jest.fn();
  fatal = jest.fn();
}

export const createMockConfigService = (config: Record<string, any> = {}): MockConfigService => {
  return new MockConfigService({
    'app.nodeEnv': 'test',
    'app.port': 3000,
    'app.apiPrefix': 'api',
    'database.url': 'postgresql://test:test@localhost:5432/test_db',
    'logging.level': 'error',
    'logging.prettyPrint': false,
    'security.corsOrigins': ['http://localhost:3000'],
    'security.rateLimitTtl': 60000,
    'security.rateLimitMax': 10,
    ...config,
  });
};

export const createMockLogger = (): MockLogger => {
  return new MockLogger({
    pinoHttp: {
      level: 'error',
      autoLogging: false,
    },
  });
};

export const createTestingModule = async (
  imports: any[] = [],
  controllers: any[] = [],
  providers: any[] = [],
): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports,
    controllers,
    providers: [
      {
        provide: ConfigService,
        useValue: createMockConfigService(),
      },
      {
        provide: PinoLogger,
        useValue: createMockLogger(),
      },
      ...providers,
    ],
  }).compile();
};
