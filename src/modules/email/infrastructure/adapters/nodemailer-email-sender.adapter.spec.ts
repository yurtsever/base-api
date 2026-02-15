import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { NodemailerEmailSenderAdapter } from './nodemailer-email-sender.adapter';
import { EmailSendFailedException } from '../../domain/exceptions/email-send-failed.exception';

describe('NodemailerEmailSenderAdapter', () => {
  let adapter: NodemailerEmailSenderAdapter;
  let mailerService: { sendMail: jest.Mock };

  beforeEach(async () => {
    mailerService = { sendMail: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NodemailerEmailSenderAdapter, { provide: MailerService, useValue: mailerService }],
    }).compile();

    adapter = module.get<NodemailerEmailSenderAdapter>(NodemailerEmailSenderAdapter);
  });

  it('should send email via mailer service', async () => {
    const message = { to: 'user@example.com', subject: 'Test', text: 'Hello' };

    await adapter.send(message);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Test',
      text: 'Hello',
      html: undefined,
      template: undefined,
      context: undefined,
    });
  });

  it('should send email with template', async () => {
    const message = { to: 'user@example.com', subject: 'Welcome', template: 'welcome', context: { name: 'John' } };

    await adapter.send(message);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Welcome',
      text: undefined,
      html: undefined,
      template: 'welcome',
      context: { name: 'John' },
    });
  });

  it('should wrap mailer errors in EmailSendFailedException', async () => {
    mailerService.sendMail.mockRejectedValue(new Error('SMTP connection refused'));
    const message = { to: 'user@example.com', subject: 'Test', text: 'Hello' };

    await expect(adapter.send(message)).rejects.toThrow(EmailSendFailedException);
  });
});
