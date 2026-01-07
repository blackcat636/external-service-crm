import { getServiceToken, initiateSSO } from "./auth";
import { getTelegramUsername } from "./telegram-auth";

const EXTERNAL_SERVICE_URL =
  process.env.NEXT_PUBLIC_EXTERNAL_SERVICE_URL || "http://localhost:3001";

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown>;
  includeTelegramUsername?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = getServiceToken();

  if (!token) {
    // Redirect to SSO if not authenticated
    if (typeof window !== "undefined") {
      initiateSSO();
    }
    throw new Error("Not authenticated");
  }

  const { body, includeTelegramUsername, ...restOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(restOptions.headers as Record<string, string>),
  };

  // Add Telegram username header if requested
  if (includeTelegramUsername) {
    const telegramUsername = getTelegramUsername();
    if (telegramUsername) {
      headers["X-Telegram-Username"] = telegramUsername;
    }
  }

  // Build full URL
  const fullUrl = endpoint.startsWith("http")
    ? endpoint
    : `${EXTERNAL_SERVICE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const config: RequestInit = {
    ...restOptions,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(fullUrl, config);

  // Handle 401 - redirect to SSO
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      initiateSSO();
    }
    throw new Error("Authentication required");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "An error occurred");
  }

  // Handle new response format: { status, data, message }
  if (data.status && data.data !== undefined) {
    return data.data as T;
  }

  // Fallback to old format: { success, data }
  if (data.success !== undefined) {
    return data.data as T;
  }

  return data as T;
}

export function handleAPIError(error: unknown): Response {
  console.error("API Error:", error);

  if (error instanceof Error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  return Response.json(
    { success: false, error: "An unknown error occurred" },
    { status: 500 }
  );
}

export function unauthorizedResponse(): Response {
  return Response.json(
    { status: 401, message: "Authentication required" },
    { status: 401 }
  );
}

export function badRequestResponse(message: string): Response {
  return Response.json({ success: false, error: message }, { status: 400 });
}
