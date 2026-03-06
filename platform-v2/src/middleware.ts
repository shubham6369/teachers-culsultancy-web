import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(_request: NextRequest) {
    // Note: Cloudflare Pages (Edge) does not support ioredis. 
    // You can use @upstash/redis or Cloudflare KV for rate limiting instead.

    // For now, allow all requests without rate limiting to ensure the build and edge deployment succeeds.
    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
