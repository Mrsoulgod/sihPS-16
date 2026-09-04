export interface ResponseMetadata {
  timestamp: string;
  request_id: string;
  pagination?: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  metadata: ResponseMetadata;
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[];
  };
  metadata: ResponseMetadata;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HealthCheckData {
  status: string;
  project_name: string;
  environment: string;
  version: string;
  database_status: string;
  uptime_seconds: number;
  timestamp: string;
}
