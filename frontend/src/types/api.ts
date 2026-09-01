export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
  detail?:
    | string
    | Array<{ loc: (string | number)[]; msg: string; type: string }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export type ApiDto<T> = T & Record<string, unknown>;
