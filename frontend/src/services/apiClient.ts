/**
 * API Client with built-in Ngrok bypass header & fallback resilience.
 * Ensures compatibility with Shared Hosting, Static Exports, and Ngrok tunnels.
 */

export interface RequestOptions extends RequestInit {
  timeoutMs?: 30000;
}

export const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "https://smartschool-api.ngrok-free.app";

export const N8N_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://smartschool-n8n.ngrok-free.app/webhook/chat";

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T | null; error: string | null; isMockFallback: boolean }> {
  const { timeoutMs = 30000, headers, ...rest } = options;

  // Construct absolute or relative URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${FASTAPI_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  // Enforce Ngrok Bypass and JSON headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    // CRITICAL REQUIREMENT: Ngrok browser warning bypass header
    "ngrok-skip-browser-warning": "true",
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    return { data, error: null, isMockFallback: false };
  } catch (err: unknown) {
    clearTimeout(timer);
    const errorMessage =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Koneksi ke server backend timeout (Ngrok mungkin tidak merespons)."
          : err.message
        : "Terjadi gangguan saat menghubungkan ke backend.";

    return {
      data: null,
      error: errorMessage,
      isMockFallback: true,
    };
  }
}

/**
 * Health check to verify if the FastAPI backend via Ngrok is responsive.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await apiClient<{ status: string }>("health", {
      method: "GET",
      timeoutMs: 30000,
    });
    return res.data?.status === "ok" || res.data?.status === "healthy";
  } catch {
    return false;
  }
}
