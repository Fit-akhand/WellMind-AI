import { getToken, logoutUser } from './authStorage';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '';

export function apiUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function notifyUnauthorized() {
  logoutUser();
  window.dispatchEvent(new CustomEvent('wellmind:unauthorized'));
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), { ...options, headers });
  } catch {
    throw new ApiError('Network error. Please try again.', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    notifyUnauthorized();
    throw new ApiError((data as { msg?: string }).msg || 'Please sign in again.', 401, data);
  }

  if (!response.ok) {
    const message =
      (data as { msg?: string; error?: string; message?: string }).msg ||
      (data as { error?: string }).error ||
      (data as { message?: string }).message ||
      'Request failed';
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
