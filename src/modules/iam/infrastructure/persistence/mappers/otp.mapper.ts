import { Otp } from '../../../domain/models/otp.model';
import { OtpEntity } from '../entities/otp.entity';

export class OtpMapper {
  static toDomain(entity: OtpEntity): Otp {
    return new Otp(
      entity.id,
      entity.code,
      entity.email,
      entity.expiresAt,
      entity.isUsed,
      entity.attempts,
      entity.createdAt,
    );
  }

  static toEntity(domain: Otp): OtpEntity {
    const entity = new OtpEntity();
    entity.id = domain.id;
    entity.code = domain.code;
    entity.email = domain.email;
    entity.expiresAt = domain.expiresAt;
    entity.isUsed = domain.isUsed;
    entity.attempts = domain.attempts;
    return entity;
  }
}
