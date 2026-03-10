/**
 * @file Centralized API Client
 * @module services/api-client
 *
 * Wraps the `ky` HTTP library with project-specific defaults:
 * - Automatic Firebase Auth token injection (client-side) or manual token pass-through (server-side).
 * - Global 401 → auto-logout via custom DOM event.
 * - Backend error message extraction so callers receive readable messages.
 * - Spring Boot-friendly query-param serialization (comma-joined arrays).
 * - Next.js `fetch` pass-through for ISR / revalidation tags.
 */

import ky, { Options } from 'ky';
import { auth } from '@/lib/firebase';

/** Extends Ky options with Next.js caching props and an optional server-side token. */
export type ApiOptions = Omit<Options, 'searchParams'> & {
  searchParams?: Record<string, unknown> | URLSearchParams;
  next?: NextFetchRequestConfig['next'];
  cache?: RequestCache;
  /** Pre-fetched token for server-side calls where Firebase Auth is unavailable. */
  token?: string;
};

/** Shape of error bodies returned by the Spring Boot backend. */
interface BackendError {
  message?: string;
  detail?: string;
  error?: string;
}

/** Next.js-specific fetch extension (until official types are available). */
interface NextFetchRequestConfig {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

/**
 * Resolves the backend base URL depending on the runtime environment.
 * Server-side uses `API_BASE_URL_SERVER`; client-side uses `NEXT_PUBLIC_API_BASE_URL`.
 * Falls back to `http://localhost:8080` when neither is set.
 */
const getBaseUrl = () => {
  const url = typeof window === 'undefined'
    ? (process.env.API_BASE_URL_SERVER!)
    : (process.env.NEXT_PUBLIC_API_BASE_URL!);

  if (!url) return 'http://localhost:8080';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

const BASE_URL = getBaseUrl();

const kyInstance = ky.create({
  prefixUrl: BASE_URL,
  timeout: 10000,
  // Use Next.js native fetch so ISR caching / revalidation tags work correctly.
  fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init),
  hooks: {
    beforeRequest: [
      /**
       * Injects an Authorization header before every outgoing request.
       * Priority: server-side manual token > client-side Firebase token.
       */
      async (request, options: ApiOptions) => {
        if (options.token) {
          request.headers.set('Authorization', `Bearer ${options.token}`);
          return;
        }

        if (typeof window !== 'undefined' && auth.currentUser) {
          try {
            const token = await auth.currentUser.getIdToken();
            request.headers.set('Authorization', `Bearer ${token}`);
          } catch (e) {
            if (process.env.NODE_ENV === 'development') console.warn('[Auth] Token fetch failed', e);
          }
        }
      },
    ],
    beforeError: [
      async (error) => {
        // Dispatch a custom event on 401 so AuthProvider can trigger logout globally.
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event("auth:unauthorized"));
          }
        }

        // Try to extract the backend's structured error message (e.g., "Insufficient stock").
        if (error.response) {
          try {
            const body = await error.response.json() as BackendError;
            if (body?.message) {
              error.message = body.message;
            }
          } catch {
            // JSON parsing failed — keep the original generic message.
          }
        }

        return error;
      },
    ],
  },
});

/**
 * Converts search-param records into a `URLSearchParams` instance that
 * Spring Boot can parse. Array values are joined with commas
 * (`?category=a,b`) instead of repeated keys (`?category=a&category=b`).
 */
const normalizeParams = (options: ApiOptions) => {
  if (!options.searchParams || options.searchParams instanceof URLSearchParams) {
    return options.searchParams;
  }

  const newParams = new URLSearchParams();
  Object.entries(options.searchParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    newParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
  });
  return newParams;
};

/**
 * Internal request dispatcher shared by all HTTP verb helpers.
 * Merges custom options (token, Next.js caching, search params) with Ky defaults.
 */
async function request<T>(method: string, url: string, options: ApiOptions = {}): Promise<T> {
  const { token, next, cache, searchParams, ...kyOptions } = options;

  // Strip leading slash — Ky's prefixUrl already provides the base.
  const finalUrl = url.startsWith('/') ? url.slice(1) : url;

  return kyInstance(finalUrl, {
    method,
    ...kyOptions,
    next,
    cache,
    searchParams: searchParams ? normalizeParams(options) : undefined,
    token, // Passed through to beforeRequest hook.
  } as Options).json<T>();
}

/** Convenience wrappers for each HTTP verb. */
const apiClient = {
  get: <T>(url: string, options?: ApiOptions) => request<T>('GET', url, options),
  post: <T>(url: string, body?: unknown, options?: ApiOptions) => request<T>('POST', url, { ...options, ...(body !== undefined && { json: body }) }),
  put: <T>(url: string, body?: unknown, options?: ApiOptions) => request<T>('PUT', url, { ...options, ...(body !== undefined && { json: body }) }),
  patch: <T>(url: string, body?: unknown, options?: ApiOptions) => request<T>('PATCH', url, { ...options, ...(body !== undefined && { json: body }) }),
  delete: <T>(url: string, options?: ApiOptions) => request<T>('DELETE', url, options),
};

export default apiClient;