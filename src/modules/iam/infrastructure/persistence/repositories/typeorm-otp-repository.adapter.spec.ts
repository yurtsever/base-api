import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmOtpRepositoryAdapter } from './typeorm-otp-repository.adapter';
import { OtpEntity } from '../entities/otp.entity';
import { Otp } from '../../../domain/models/otp.model';

describe('TypeOrmOtpRepositoryAdapter', () => {
  let adapter: TypeOrmOtpRepositoryAdapter;
  let mockRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockOtpEntity: OtpEntity = {
    id: 'otp-id',
    code: '123456',
    email: 'test@example.com',
    expiresAt: new Date(Date.now() + 300000),
    isUsed: false,
    attempts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeOrmOtpRepositoryAdapter, { provide: getRepositoryToken(OtpEntity), useValue: mockRepository }],
    }).compile();

    adapter = module.get<TypeOrmOtpRepositoryAdapter>(TypeOrmOtpRepositoryAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('save', () => {
    it('should save and return OTP', async () => {
      mockRepository.save.mockResolvedValue(mockOtpEntity);

      const otp = new Otp('otp-id', '123456', 'test@example.com', mockOtpEntity.expiresAt, false, 0);
      const result = await adapter.save(otp);

      expect(result).toBeInstanceOf(Otp);
      expect(result.code).toBe('123456');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findLatestByEmail', () => {
    it('should return OTP when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockOtpEntity);

      const result = await adapter.findLatestByEmail('test@example.com');

      expect(result).toBeInstanceOf(Otp);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return null when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await adapter.findLatestByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('invalidateAllByEmail', () => {
    it('should update all unused OTPs for email', async () => {
      mockRepository.update.mockResolvedValue({ affected: 2 });

      await adapter.invalidateAllByEmail('test@example.com');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { email: 'test@example.com', isUsed: false },
        { isUsed: true },
      );
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired OTPs', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 5 });

      await adapter.deleteExpired();

      expect(mockRepository.delete).toHaveBeenCalled();
    });
  });
});
