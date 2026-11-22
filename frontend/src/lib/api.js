const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3002"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(
      `Cannot reach the backend at ${API_BASE_URL}. Make sure the backend is running and CLIENT_ORIGIN is configured.`,
      0,
      error
    );
  }

  let payload = null;

  if (response.status !== 204) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      payload = text ? { message: text } : null;
    }
  }

  if (!response.ok) {
    const validationMessages = Array.isArray(payload?.errors)
      ? payload.errors.map((item) => item.message).filter(Boolean)
      : [];

    const message = [payload?.message || `Request failed (${response.status})`, ...validationMessages]
      .filter(Boolean)
      .join(" · ");

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
