export interface SuccessResponse<T> {
  statusCode: number;
  data: T;
  timestamp: string;
  path: string;
}
