export const AUDIT_EVENT_NAME = 'audit.entry.created';

export class AuditEvent {
  public readonly action: string;
  public readonly resource: string;
  public readonly resourceId?: string;
  public readonly userId?: string;
  public readonly userEmail?: string;
  public readonly ipAddress: string;
  public readonly method: string;
  public readonly path: string;
  public readonly statusCode: number;
  public readonly metadata?: Record<string, unknown>;
  public readonly duration: number;

  constructor(props: {
    action: string;
    resource: string;
    resourceId?: string;
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    method?: string;
    path: string;
    statusCode: number;
    metadata?: Record<string, unknown>;
    duration?: number;
  }) {
    this.action = props.action;
    this.resource = props.resource;
    this.resourceId = props.resourceId;
    this.userId = props.userId;
    this.userEmail = props.userEmail;
    this.ipAddress = props.ipAddress ?? 'system';
    this.method = props.method ?? 'INTERNAL';
    this.path = props.path;
    this.statusCode = props.statusCode;
    this.metadata = props.metadata;
    this.duration = props.duration ?? 0;
  }
}
