// Centralized API Client for Zimor Storefront and Admin Portal
// Directly connects the browser to the backend API service (with credentials & auth headers)
function resolveBackendUrl(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const envUrl =
    typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL)
      : (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL);

  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (isProduction) {
    if (typeof window !== 'undefined') {
      console.warn('[ZIMOR CLIENT] NEXT_PUBLIC_BACKEND_URL is not set in production. Using relative origin.');
    }
    return '';
  }

  return 'http://localhost:5001';
}

export const BACKEND_URL = resolveBackendUrl();

export function apiUrl(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (path.startsWith('/api')) {
    return `${BACKEND_URL}${path}`;
  }
  return `${BACKEND_URL}/api${path}`;
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
