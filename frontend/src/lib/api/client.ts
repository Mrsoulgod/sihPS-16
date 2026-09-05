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

export interface ApiClientFunction {
  <T>(endpoint: string, options?: RequestInit): Promise<ApiSuccessResponse<T>>;
  get<T>(endpoint: string, options?: RequestInit): Promise<ApiSuccessResponse<T>>;
  post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiSuccessResponse<T>>;
  put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiSuccessResponse<T>>;
  patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiSuccessResponse<T>>;
  delete<T>(endpoint: string, options?: RequestInit): Promise<ApiSuccessResponse<T>>;
}

export const apiClient: ApiClientFunction = async function <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiSuccessResponse<T>> {
  const rawBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/v1\/?$/, "");
  
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  cleanEndpoint = cleanEndpoint.replace(/^\/api\/v1/, "");
  
  const url = `${rawBase}/api/v1${cleanEndpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach token if present and not already specified
  if (!headers.has("Authorization") && typeof window !== "undefined") {
    const token = localStorage.getItem("nlams_access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok || (json && typeof json === "object" && "success" in json && json.success === false)) {
    const errorData = json?.error || {
      code: "API_ERROR",
      message: json?.message || "An unexpected error occurred.",
      details: [],
    };
    throw new ApiClientError(response.status, errorData);
  }

  if (json && typeof json === "object" && "success" in json) {
    return json as ApiSuccessResponse<T>;
  }

  return {
    success: true,
    data: json,
    message: "Success",
    metadata: {
      timestamp: new Date().toISOString(),
      request_id: "",
    },
  } as ApiSuccessResponse<T>;
} as ApiClientFunction;

apiClient.get = async function <T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiSuccessResponse<T>> {
  return apiClient<T>(endpoint, { ...options, method: "GET" });
};

apiClient.post = async function <T>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<ApiSuccessResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: "POST",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
};

apiClient.put = async function <T>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<ApiSuccessResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
};

apiClient.patch = async function <T>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<ApiSuccessResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
};

apiClient.delete = async function <T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiSuccessResponse<T>> {
  return apiClient<T>(endpoint, { ...options, method: "DELETE" });
};
