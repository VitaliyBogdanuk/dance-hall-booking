/**
 * Client-side API fetcher helpers with automatic error handling
 */

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export class FetchError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "FetchError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  
  if (!contentType?.includes("application/json")) {
    if (!response.ok) {
      throw new FetchError(
        "HTTP_ERROR",
        `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.text() as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = data.error || data;
    throw new FetchError(
      error.code || "UNKNOWN_ERROR",
      error.message || "An error occurred",
      error.details
    );
  }

  return data;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return handleResponse<T>(response);
}

/**
 * Convert datetime-local input value to ISO string
 */
export function datetimeLocalToISO(value: string): string {
  if (!value) return "";
  // datetime-local format: YYYY-MM-DDTHH:mm
  // Convert to ISO by appending seconds and timezone
  return new Date(value).toISOString();
}

/**
 * Convert ISO string to datetime-local input value
 */
export function isoToDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  // Format: YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
