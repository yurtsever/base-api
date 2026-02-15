export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}
