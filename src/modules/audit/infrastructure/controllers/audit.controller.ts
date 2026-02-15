import { Controller, Get, Inject, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../iam/infrastructure/decorators/roles.decorator';
import { GET_AUDIT_ENTRIES_USE_CASE } from '../../application/ports/get-audit-entries.use-case';
import type { GetAuditEntriesUseCasePort } from '../../application/ports/get-audit-entries.use-case';
import { GET_AUDIT_ENTRY_BY_ID_USE_CASE } from '../../application/ports/get-audit-entry-by-id.use-case';
import type { GetAuditEntryByIdUseCasePort } from '../../application/ports/get-audit-entry-by-id.use-case';
import { AuditQueryDto } from '../../application/dtos/audit-query.dto';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(
    @Inject(GET_AUDIT_ENTRIES_USE_CASE)
    private readonly getAuditEntriesUseCase: GetAuditEntriesUseCasePort,
    @Inject(GET_AUDIT_ENTRY_BY_ID_USE_CASE)
    private readonly getAuditEntryByIdUseCase: GetAuditEntryByIdUseCasePort,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get audit log entries (admin only)' })
  async getAuditEntries(@Query() query: AuditQueryDto) {
    return this.getAuditEntriesUseCase.execute({
      limit: query.limit,
      offset: query.offset,
      userId: query.userId,
      action: query.action,
      resource: query.resource,
      entityId: query.entityId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a specific audit log entry (admin only)' })
  async getAuditEntryById(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAuditEntryByIdUseCase.execute(id);
  }
}
