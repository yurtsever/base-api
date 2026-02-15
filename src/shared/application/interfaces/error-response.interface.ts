export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  errorCode: string;
  message: string;
  details?: unknown;
  requestId?: string;
}
