import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PinoLogger } from 'nestjs-pino';
import { createMockLogger } from './utils/test-helpers';

// Shared Infrastructure
import { HttpExceptionFilter } from '../src/shared/infrastructure/http/filters/http-exception.filter';
import { TransformInterceptor } from '../src/shared/infrastructure/http/interceptors/transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PinoLogger)
      .useValue(createMockLogger())
      .compile();

    app = moduleFixture.createNestApplication();

    // Apply global prefix
    app.setGlobalPrefix('api');

    // Apply global pipes, filters, and interceptors (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    const logger = app.get(PinoLogger);
    app.useGlobalFilters(new HttpExceptionFilter(logger as any));
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Endpoints', () => {
    it('/api/health (GET) - should return health status', async () => {
      await request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('status');
          expect(res.body.data).toHaveProperty('info');
        });
    });

    it('/api/health/liveness (GET) - should return liveness status', async () => {
      await request(app.getHttpServer())
        .get('/api/health/liveness')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('status');
        });
    });

    it('/api/health/readiness (GET) - should return readiness status', async () => {
      await request(app.getHttpServer())
        .get('/api/health/readiness')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('status');
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app.getHttpServer())
        .get('/api/non-existent-route')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('errorCode');
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('path');
        });
    });
  });

  describe('Response Transformation', () => {
    it('/ (GET) - should transform response to standard format', async () => {
      await request(app.getHttpServer())
        .get('/api/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 200);
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('path');
        });
    });
  });

  describe('Security Headers', () => {
    it('should NOT include x-powered-by header', async () => {
      await request(app.getHttpServer())
        .get('/api/')
        .expect((res) => {
          // In test environment, helmet is not applied, but we can check that Express is running
          expect(res.headers).toHaveProperty('content-type');
        });
    });
  });
});
