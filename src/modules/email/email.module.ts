import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

// Domain Ports
import { EMAIL_SENDER_PORT } from './domain/ports/email-sender.port';

// Application Use Cases
import { SEND_EMAIL_USE_CASE } from './application/ports/send-email.use-case';
import { SendEmailUseCase } from './application/use-cases/send-email.use-case';

// Infrastructure
import { NodemailerEmailSenderAdapter } from './infrastructure/adapters/nodemailer-email-sender.adapter';
import { EmailService } from './infrastructure/services/email.service';
import { EmailController } from './infrastructure/controllers/email.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('email.host'),
          port: configService.get<number>('email.port'),
          secure: configService.get<boolean>('email.secure'),
          auth: {
            user: configService.get<string>('email.user'),
            pass: configService.get<string>('email.password'),
          },
        },
        defaults: {
          from: configService.get<string>('email.defaultFrom'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [EmailController],
  providers: [
    // Output Adapter (implementing Domain Port)
    { provide: EMAIL_SENDER_PORT, useClass: NodemailerEmailSenderAdapter },

    // Use Case (Input Port)
    { provide: SEND_EMAIL_USE_CASE, useClass: SendEmailUseCase },

    // Infrastructure Services
    EmailService,
  ],
  exports: [EmailService, EMAIL_SENDER_PORT],
})
export class EmailModule {}
