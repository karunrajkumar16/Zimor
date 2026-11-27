// Centralized API Client for Zimor Storefront and Admin Portal
// In the browser: Requests use same-origin relative paths (/api/...) routed through Next.js server-side API proxy.
// On the server (SSR / Route Handlers): Requests directly call BACKEND_URL without public exposure.

export function resolveBackendUrl(): string {
  if (typeof window === 'undefined') {
    return (process.env.BACKEND_URL || 'http://localhost:5001').trim().replace(/\/+$/, '');
  }
  return '';
}

export const BACKEND_URL = resolveBackendUrl();

export function apiUrl(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = resolveBackendUrl();
  if (path.startsWith('/api')) {
    return `${base}${path}`;
  }
  return `${base}/api${path}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = apiUrl(endpoint);
  const headers = new Headers(options.headers || {});

  if (typeof window !== 'undefined') {
    const isAdminTarget =
      endpoint.includes('/admin') ||
      endpoint === '/api/auth/me' ||
      endpoint === '/api/auth/logout' ||
      (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

    const adminToken = localStorage.getItem('zimor_admin_token');
    const customerToken =
      sessionStorage.getItem('zimor_customer_token') ||
      localStorage.getItem('zimor_customer_token');

    const token = isAdminTarget ? adminToken : (customerToken || adminToken);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });
}
