import { ApiErrorResponse, ApiSuccessResponse } from "../types/api";
import { handleMockApiRequest } from "./mock_fallback";

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
  <T>(endpoint: string, options?: RequestInit & { params?: Record<string, any> }): Promise<ApiSuccessResponse<T>>;
  get<T>(endpoint: string, options?: RequestInit & { params?: Record<string, any> }): Promise<ApiSuccessResponse<T>>;
  post<T>(endpoint: string, data?: any, options?: RequestInit & { params?: Record<string, any> }): Promise<ApiSuccessResponse<T>>;
  put<T>(endpoint: string, data?: any, options?: RequestInit & { params?: Record<string, any> }): Promise<ApiSuccessResponse<T>>;
  patch<T>(endpoint: string, data?: any, options?: RequestInit & { params?: Record<string, any> }): Promise<ApiSuccessResponse<T>>;
  delete<T>(endpoint: string, options?: RequestInit & { params?: Record<string, any> }): Promise<ApiSuccessResponse<T>>;
}

export const apiClient: ApiClientFunction = async function <T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any> } = {}
): Promise<ApiSuccessResponse<T>> {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  let rawBase = (envUrl || "http://localhost:8000")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/v1\/?$/, "");

  // Detect HTTPS -> HTTP mixed content on deployed platforms (e.g., Vercel)
  const isHttpsClient = typeof window !== "undefined" && window.location.protocol === "https:";
  if (isHttpsClient && !envUrl && rawBase.startsWith("http://")) {
    return handleMockApiRequest<T>(endpoint, options);
  }
  
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  cleanEndpoint = cleanEndpoint.replace(/^\/api\/v1/, "");

  // Append query params if specified in options
  if (options.params && Object.keys(options.params).length > 0) {
    const qParams = new URLSearchParams();
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        qParams.append(k, String(v));
      }
    });
    const qs = qParams.toString();
    if (qs) {
      cleanEndpoint += `${cleanEndpoint.includes("?") ? "&" : "?"}${qs}`;
    }
  }
  
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

  // Set 3.5s timeout controller to prevent infinite UI hangs
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

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
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[NLAMS Live Cloud Fallback] Serving statutory data for ${endpoint}:`, err?.message || err);
    return handleMockApiRequest<T>(cleanEndpoint, options);
  }
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
