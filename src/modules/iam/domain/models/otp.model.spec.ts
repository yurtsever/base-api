import { Otp } from './otp.model';

describe('Otp', () => {
  const createOtp = (overrides: Partial<{ expiresAt: Date; isUsed: boolean; attempts: number }> = {}): Otp => {
    return new Otp(
      'otp-id',
      '123456',
      'test@example.com',
      overrides.expiresAt ?? new Date(Date.now() + 300000),
      overrides.isUsed ?? false,
      overrides.attempts ?? 0,
      new Date(),
    );
  };

  describe('isExpired', () => {
    it('should return false when not expired', () => {
      const otp = createOtp();
      expect(otp.isExpired()).toBe(false);
    });

    it('should return true when expired', () => {
      const otp = createOtp({ expiresAt: new Date(Date.now() - 1000) });
      expect(otp.isExpired()).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should return true when not expired and not used', () => {
      const otp = createOtp();
      expect(otp.isValid()).toBe(true);
    });

    it('should return false when expired', () => {
      const otp = createOtp({ expiresAt: new Date(Date.now() - 1000) });
      expect(otp.isValid()).toBe(false);
    });

    it('should return false when used', () => {
      const otp = createOtp({ isUsed: true });
      expect(otp.isValid()).toBe(false);
    });
  });

  describe('use', () => {
    it('should mark OTP as used', () => {
      const otp = createOtp();
      expect(otp.isUsed).toBe(false);
      otp.use();
      expect(otp.isUsed).toBe(true);
    });
  });

  describe('incrementAttempts', () => {
    it('should increment attempts by 1', () => {
      const otp = createOtp();
      expect(otp.attempts).toBe(0);
      otp.incrementAttempts();
      expect(otp.attempts).toBe(1);
      otp.incrementAttempts();
      expect(otp.attempts).toBe(2);
    });
  });

  describe('hasExceededMaxAttempts', () => {
    it('should return false when under max', () => {
      const otp = createOtp({ attempts: 3 });
      expect(otp.hasExceededMaxAttempts(5)).toBe(false);
    });

    it('should return true when at max', () => {
      const otp = createOtp({ attempts: 5 });
      expect(otp.hasExceededMaxAttempts(5)).toBe(true);
    });

    it('should return true when over max', () => {
      const otp = createOtp({ attempts: 6 });
      expect(otp.hasExceededMaxAttempts(5)).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return correct values', () => {
      const now = new Date();
      const expiresAt = new Date(Date.now() + 300000);
      const otp = new Otp('otp-id', '654321', 'user@test.com', expiresAt, false, 2, now);

      expect(otp.id).toBe('otp-id');
      expect(otp.code).toBe('654321');
      expect(otp.email).toBe('user@test.com');
      expect(otp.expiresAt).toBe(expiresAt);
      expect(otp.isUsed).toBe(false);
      expect(otp.attempts).toBe(2);
      expect(otp.createdAt).toBe(now);
    });
  });
});
