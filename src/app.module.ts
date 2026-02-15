import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Shared Infrastructure
import configuration from './shared/infrastructure/config/configuration';
import { validate } from './shared/infrastructure/config/env.validation';
import { createLoggerConfig } from './shared/infrastructure/config/logger.config';
import { createThrottlerConfig } from './shared/infrastructure/config/throttler.config';
import { DatabaseModule } from './shared/infrastructure/database/database.module';

// Modules (Bounded Contexts)
import { HealthModule } from './modules/health/health.module';
import { IamModule } from './modules/iam/iam.module';
import { AuditModule } from './modules/audit/audit.module';
import { EmailModule } from './modules/email/email.module';
import { AuditInterceptor } from './modules/audit/infrastructure/interceptors/audit.interceptor';
import { JwtAuthGuard } from './modules/iam/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './modules/iam/infrastructure/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
        const logLevel = configService.get<string>('logging.level', 'info');
        return createLoggerConfig(nodeEnv, logLevel);
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>('security.rateLimitTtl', 60000);
        const limit = configService.get<number>('security.rateLimitMax', 10);
        return createThrottlerConfig(ttl, limit);
      },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    HealthModule,
    IamModule,
    AuditModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useExisting: AuditInterceptor,
    },
  ],
})
export class AppModule {}
