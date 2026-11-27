import { NextRequest, NextResponse } from 'next/server';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
]);

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  let backendBase = (process.env.BACKEND_URL || 'http://127.0.0.1:5001').trim().replace(/\/+$/, '');
  if (backendBase.startsWith('http://localhost:')) {
    backendBase = backendBase.replace('http://localhost:', 'http://127.0.0.1:');
  }
  const resolvedParams = await context.params;
  const pathSegments = resolvedParams.path || [];
  const subpath = pathSegments.join('/');

  const search = req.nextUrl.search;
  const targetUrl = subpath
    ? `${backendBase}/api/${subpath}${search}`
    : `${backendBase}/api${search}`;

  // Forward incoming headers
  const forwardHeaders = new Headers();
  req.headers.forEach((val, key) => {
    const lowerKey = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lowerKey)) {
      forwardHeaders.set(key, val);
    }
  });

  // Ensure host header points to target
  try {
    const parsedTarget = new URL(targetUrl);
    forwardHeaders.set('host', parsedTarget.host);
  } catch {}

  // Request body handling
  const method = req.method.toUpperCase();
  let body: BodyInit | undefined = undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const arrayBuffer = await req.arrayBuffer();
    if (arrayBuffer.byteLength > 0) {
      body = arrayBuffer;
    }
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
      redirect: 'manual', // Preserve 301/302/307 redirects for caller (e.g. Google OAuth)
      cache: 'no-store',
    });

    // Handle redirects (e.g. Google OAuth 302)
    if (upstreamRes.status >= 300 && upstreamRes.status < 400 && upstreamRes.headers.has('location')) {
      const location = upstreamRes.headers.get('location')!;
      const redirectResponse = NextResponse.redirect(location, upstreamRes.status);
      if (typeof (upstreamRes.headers as any).getSetCookie === 'function') {
        const cookies = (upstreamRes.headers as any).getSetCookie();
        for (const cookie of cookies) {
          redirectResponse.headers.append('set-cookie', cookie);
        }
      }
      return redirectResponse;
    }

    // Forward response headers
    const responseHeaders = new Headers();
    upstreamRes.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!HOP_BY_HOP_HEADERS.has(lowerKey) && lowerKey !== 'content-encoding') {
        responseHeaders.set(key, val);
      }
    });

    // Forward set-cookie headers
    if (typeof (upstreamRes.headers as any).getSetCookie === 'function') {
      const cookies = (upstreamRes.headers as any).getSetCookie();
      if (cookies.length > 0) {
        responseHeaders.delete('set-cookie');
        for (const cookie of cookies) {
          responseHeaders.append('set-cookie', cookie);
        }
      }
    }

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`[API Proxy Error] Failed to proxy ${method} ${targetUrl}:`, err.message);
    return NextResponse.json(
      { error: 'Backend service temporarily unavailable', details: err.message },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;
export const HEAD = handleProxy;
