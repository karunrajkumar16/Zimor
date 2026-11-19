// Centralized API Client for Zimor Storefront and Admin Portal
// Directly connects the browser to the backend API service (with credentials & auth headers)
export const BACKEND_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001')
    : (process.env.BACKEND_URL || 'http://localhost:5001');

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
    const adminToken = localStorage.getItem('zimor_admin_token');
    const customerToken =
      sessionStorage.getItem('zimor_customer_token') ||
      localStorage.getItem('zimor_customer_token');
    const token = adminToken || customerToken;
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
