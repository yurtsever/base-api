import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { SEND_EMAIL_USE_CASE } from '../../application/ports/send-email.use-case';

describe('EmailController', () => {
  let controller: EmailController;
  let sendEmailUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    sendEmailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [{ provide: SEND_EMAIL_USE_CASE, useValue: sendEmailUseCase }],
    }).compile();

    controller = module.get<EmailController>(EmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('send', () => {
    it('should send email and return success message', async () => {
      const dto = { to: 'user@example.com', subject: 'Test', text: 'Hello' };

      const result = await controller.send(dto as any);

      expect(sendEmailUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ message: 'Email sent successfully' });
    });
  });
});
