import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailUseCase } from './send-email.use-case';
import { EMAIL_SENDER_PORT } from '../../domain/ports/email-sender.port';
import { EmailSendFailedException } from '../../domain/exceptions/email-send-failed.exception';
import { ValidationException } from '../../../../shared/domain/exceptions/validation.exception';

describe('SendEmailUseCase', () => {
  let useCase: SendEmailUseCase;
  let emailSender: { send: jest.Mock };

  beforeEach(async () => {
    emailSender = { send: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SendEmailUseCase, { provide: EMAIL_SENDER_PORT, useValue: emailSender }],
    }).compile();

    useCase = module.get<SendEmailUseCase>(SendEmailUseCase);
  });

  it('should send email with text content', async () => {
    const dto = { to: 'user@example.com', subject: 'Test', text: 'Hello' };

    await useCase.execute(dto);

    expect(emailSender.send).toHaveBeenCalledWith(dto);
  });

  it('should send email with html content', async () => {
    const dto = { to: 'user@example.com', subject: 'Test', html: '<p>Hello</p>' };

    await useCase.execute(dto);

    expect(emailSender.send).toHaveBeenCalledWith(dto);
  });

  it('should send email with template', async () => {
    const dto = { to: 'user@example.com', subject: 'Test', template: 'welcome', context: { name: 'John' } };

    await useCase.execute(dto);

    expect(emailSender.send).toHaveBeenCalledWith(dto);
  });

  it('should throw ValidationException when no content is provided', async () => {
    const dto = { to: 'user@example.com', subject: 'Test' };

    await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    expect(emailSender.send).not.toHaveBeenCalled();
  });

  it('should wrap adapter errors in EmailSendFailedException', async () => {
    emailSender.send.mockRejectedValue(new Error('SMTP connection refused'));
    const dto = { to: 'user@example.com', subject: 'Test', text: 'Hello' };

    await expect(useCase.execute(dto)).rejects.toThrow(EmailSendFailedException);
  });

  it('should re-throw EmailSendFailedException from adapter', async () => {
    const exception = new EmailSendFailedException('upstream error');
    emailSender.send.mockRejectedValue(exception);
    const dto = { to: 'user@example.com', subject: 'Test', text: 'Hello' };

    await expect(useCase.execute(dto)).rejects.toThrow(exception);
  });
});
