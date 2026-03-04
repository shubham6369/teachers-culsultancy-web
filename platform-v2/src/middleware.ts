import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from 'ioredis';

// Note: In production, use your actual Redis URL from environment variables
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const RATELIMIT_WINDOW = 60; // 1 minute
const MAX_REQUESTS = 100;    // 100 requests per minute per IP

export async function middleware(request: NextRequest) {
    const ip = request.ip || 'anonymous';
    const path = request.nextUrl.pathname;

    // Only rate limit API routes
    if (path.startsWith('/api')) {
        const key = `ratelimit:${ip}`;

        // Simple Increment and Expire logic
        const current = await redis.incr(key);

        if (current === 1) {
            await redis.expire(key, RATELIMIT_WINDOW);
        }

        if (current > MAX_REQUESTS) {
            return new NextResponse(
                JSON.stringify({ success: false, message: 'Too many requests' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
