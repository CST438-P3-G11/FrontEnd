import { useAuth } from './auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export type ApiOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/**
 * Low-level fetch wrapper. Prepends the API base URL, attaches the JWT,
 * and throws ApiError on non-2xx responses.
 */
export async function apiFetch<T>(
  path: string,
  token: string | null,
  options: ApiOptions = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, body, `API ${res.status} for ${path}`);
  }
  return body as T;
}

/**
 * Hook-style helper that auto-injects the current user's JWT and signs them
 * out on 401. Use this from components.
 */
export function useApi() {
  const { token, signOut } = useAuth();

  return {
    async get<T>(path: string): Promise<T> {
      try {
        return await apiFetch<T>(path, token, { method: 'GET' });
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) await signOut();
        throw e;
      }
    },
    async post<T>(path: string, body: unknown): Promise<T> {
      try {
        return await apiFetch<T>(path, token, {
          method: 'POST',
          body: JSON.stringify(body),
        });
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) await signOut();
        throw e;
      }
    },
  };
}
