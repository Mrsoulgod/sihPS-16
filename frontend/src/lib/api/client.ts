import { ApiErrorResponse, ApiSuccessResponse } from "../types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClientError extends Error {
  code: string;
  details: any[];
  status: number;

  constructor(status: number, errorResponse: ApiErrorResponse["error"]) {
    super(errorResponse.message);
    this.name = "ApiClientError";
    this.code = errorResponse.code;
    this.details = errorResponse.details;
    this.status = status;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiSuccessResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    const errorData = json.error || {
      code: "API_ERROR",
      message: json.message || "An unexpected error occurred.",
      details: [],
    };
    throw new ApiClientError(response.status, errorData);
  }

  return json as ApiSuccessResponse<T>;
}
