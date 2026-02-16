import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import type { OtpRepositoryPort } from '../../../domain/ports/otp-repository.port';
import { Otp } from '../../../domain/models/otp.model';
import { OtpEntity } from '../entities/otp.entity';
import { OtpMapper } from '../mappers/otp.mapper';

@Injectable()
export class TypeOrmOtpRepositoryAdapter implements OtpRepositoryPort {
  constructor(
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
  ) {}

  async save(otp: Otp): Promise<Otp> {
    const entity = OtpMapper.toEntity(otp);
    const saved = await this.otpRepository.save(entity);
    return OtpMapper.toDomain(saved);
  }

  async findLatestByEmail(email: string): Promise<Otp | null> {
    const entity = await this.otpRepository.findOne({
      where: { email },
      order: { createdAt: 'DESC' },
    });
    return entity ? OtpMapper.toDomain(entity) : null;
  }

  async invalidateAllByEmail(email: string): Promise<void> {
    await this.otpRepository.update({ email, isUsed: false }, { isUsed: true });
  }

  async deleteExpired(): Promise<void> {
    await this.otpRepository.delete({ expiresAt: LessThan(new Date()) });
  }
}
