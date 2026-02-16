import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

// Shared Infrastructure
import { HttpExceptionFilter } from './shared/infrastructure/http/filters/http-exception.filter';
import { TransformInterceptor } from './shared/infrastructure/http/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './shared/infrastructure/http/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Get ConfigService
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');

  const corsOrigins = configService.get<string[]>('security.corsOrigins', ['http://localhost:3000']);

  // Logger - Use PinoLogger for filters
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Security - Helmet
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: nodeEnv === 'production',
    }),
  );

  // Cookie Parser
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Global Prefix
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe
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

  // Global Exception Filter - Cast logger to any to avoid type issues
  app.useGlobalFilters(new HttpExceptionFilter(logger as any));

  // Global Interceptors
  app.useGlobalInterceptors(new TransformInterceptor(), new TimeoutInterceptor(30000));

  // Swagger Documentation
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription(
        `
## Architecture Overview

This API follows a **Layered Architecture** pattern:
- **Controller Layer**: HTTP request handling and validation
- **Service Layer**: Business logic implementation
- **Repository Layer**: Data access and persistence

## Features
- 🔒 **Security**: Helmet, CORS, Rate Limiting, Input Validation
- 🛡️ **Error Handling**: Standardized error responses with request tracking
- 📝 **Logging**: Structured logging with Pino
- 🏥 **Health Checks**: Kubernetes-ready liveness and readiness probes
- ⚡ **Performance**: Request timeout handling and response transformation
- 📊 **Database**: TypeORM with PostgreSQL support

## Response Format

### Success Response
\`\`\`json
{
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/resource"
}
\`\`\`

### Error Response
\`\`\`json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/resource",
  "method": "POST",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "requestId": "uuid-here"
}
\`\`\`
      `,
      )
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      })
      .addTag('health', 'Health check endpoints')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('audit', 'Audit log endpoints')
      .addTag('email', 'Email endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      customSiteTitle: 'API Documentation',
      customfavIcon: 'https://nestjs.com/favicon.ico',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    logger.log(`Swagger documentation available at: http://localhost:${port}/${apiPrefix}/docs`);
  }

  // Graceful Shutdown
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Environment: ${nodeEnv}`);
}

void bootstrap();
