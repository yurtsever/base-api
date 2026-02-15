import { randomUUID } from 'crypto';
import { Entity } from '../../../../shared/domain/base/entity';

export interface AuditEntryProps {
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  method: string;
  path: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
  duration: number;
}

export class AuditEntry extends Entity<string> {
  constructor(
    id: string,
    private readonly _action: string,
    private readonly _resource: string,
    private readonly _resourceId: string | undefined,
    private readonly _userId: string | undefined,
    private readonly _userEmail: string | undefined,
    private readonly _ipAddress: string,
    private readonly _method: string,
    private readonly _path: string,
    private readonly _statusCode: number,
    private readonly _metadata: Record<string, unknown> | undefined,
    private readonly _duration: number,
    private readonly _createdAt: Date,
  ) {
    super(id);
  }

  static create(props: AuditEntryProps): AuditEntry {
    return new AuditEntry(
      randomUUID(),
      props.action,
      props.resource,
      props.resourceId,
      props.userId,
      props.userEmail,
      props.ipAddress,
      props.method,
      props.path,
      props.statusCode,
      props.metadata,
      props.duration,
      new Date(),
    );
  }

  get action(): string {
    return this._action;
  }

  get resource(): string {
    return this._resource;
  }

  get resourceId(): string | undefined {
    return this._resourceId;
  }

  get userId(): string | undefined {
    return this._userId;
  }

  get userEmail(): string | undefined {
    return this._userEmail;
  }

  get ipAddress(): string {
    return this._ipAddress;
  }

  get method(): string {
    return this._method;
  }

  get path(): string {
    return this._path;
  }

  get statusCode(): number {
    return this._statusCode;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this._metadata;
  }

  get duration(): number {
    return this._duration;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      action: this._action,
      resource: this._resource,
      resourceId: this._resourceId,
      userId: this._userId,
      userEmail: this._userEmail,
      ipAddress: this._ipAddress,
      method: this._method,
      path: this._path,
      statusCode: this._statusCode,
      metadata: this._metadata,
      duration: this._duration,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
