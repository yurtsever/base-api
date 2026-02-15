import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../iam/infrastructure/decorators/roles.decorator';
import { SendEmailRequestDto } from '../../application/dtos/send-email.dto';
import type { SendEmailUseCasePort } from '../../application/ports/send-email.use-case';
import { SEND_EMAIL_USE_CASE } from '../../application/ports/send-email.use-case';

@ApiTags('email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(
    @Inject(SEND_EMAIL_USE_CASE)
    private readonly sendEmailUseCase: SendEmailUseCasePort,
  ) {}

  @Post('send')
  @Roles('admin')
  @ApiOperation({ summary: 'Send an email (admin only)' })
  async send(@Body() dto: SendEmailRequestDto) {
    await this.sendEmailUseCase.execute(dto);
    return { message: 'Email sent successfully' };
  }
}
