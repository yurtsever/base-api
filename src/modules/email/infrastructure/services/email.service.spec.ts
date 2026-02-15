import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { SEND_EMAIL_USE_CASE } from '../../application/ports/send-email.use-case';

describe('EmailService', () => {
  let service: EmailService;
  let sendEmailUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    sendEmailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService, { provide: SEND_EMAIL_USE_CASE, useValue: sendEmailUseCase }],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('send', () => {
    it('should delegate to use case', async () => {
      const options = { to: 'user@example.com', subject: 'Test', text: 'Hello' };

      await service.send(options);

      expect(sendEmailUseCase.execute).toHaveBeenCalledWith(options);
    });
  });

  describe('sendFromTemplate', () => {
    it('should delegate to use case with template params', async () => {
      await service.sendFromTemplate('user@example.com', 'Welcome', 'welcome', { name: 'John' });

      expect(sendEmailUseCase.execute).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Welcome',
        template: 'welcome',
        context: { name: 'John' },
      });
    });
  });
});
