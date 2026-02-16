import { Otp } from '../../../domain/models/otp.model';
import { OtpEntity } from '../entities/otp.entity';
import { OtpMapper } from './otp.mapper';

describe('OtpMapper', () => {
  const now = new Date();
  const expiresAt = new Date(Date.now() + 300000);

  describe('toDomain', () => {
    it('should map entity to domain model', () => {
      const entity = new OtpEntity();
      entity.id = 'otp-id';
      entity.code = '123456';
      entity.email = 'test@example.com';
      entity.expiresAt = expiresAt;
      entity.isUsed = false;
      entity.attempts = 2;
      entity.createdAt = now;
      entity.updatedAt = now;

      const domain = OtpMapper.toDomain(entity);

      expect(domain).toBeInstanceOf(Otp);
      expect(domain.id).toBe('otp-id');
      expect(domain.code).toBe('123456');
      expect(domain.email).toBe('test@example.com');
      expect(domain.expiresAt).toBe(expiresAt);
      expect(domain.isUsed).toBe(false);
      expect(domain.attempts).toBe(2);
      expect(domain.createdAt).toBe(now);
    });
  });

  describe('toEntity', () => {
    it('should map domain model to entity', () => {
      const domain = new Otp('otp-id', '654321', 'user@test.com', expiresAt, true, 3, now);

      const entity = OtpMapper.toEntity(domain);

      expect(entity).toBeInstanceOf(OtpEntity);
      expect(entity.id).toBe('otp-id');
      expect(entity.code).toBe('654321');
      expect(entity.email).toBe('user@test.com');
      expect(entity.expiresAt).toBe(expiresAt);
      expect(entity.isUsed).toBe(true);
      expect(entity.attempts).toBe(3);
    });
  });
});
