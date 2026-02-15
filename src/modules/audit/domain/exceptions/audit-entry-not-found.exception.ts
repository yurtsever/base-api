import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../../shared/domain/exceptions/base.exception';

export class AuditEntryNotFoundException extends BaseException {
  constructor(id: string) {
    super('AUDIT_ENTRY_NOT_FOUND', `Audit entry not found: ${id}`, HttpStatus.NOT_FOUND);
  }
}
