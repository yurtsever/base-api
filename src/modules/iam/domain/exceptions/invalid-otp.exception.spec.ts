import { HttpStatus } from '@nestjs/common';
import { InvalidOtpException } from './invalid-otp.exception';

describe('InvalidOtpException', () => {
  it('should create with default message', () => {
    const exception = new InvalidOtpException();

    expect(exception.errorCode).toBe('INVALID_OTP');
    expect(exception.message).toBe('Invalid or expired OTP');
    expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should create with custom message', () => {
    const exception = new InvalidOtpException('Custom error message');

    expect(exception.errorCode).toBe('INVALID_OTP');
    expect(exception.message).toBe('Custom error message');
    expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });
});
