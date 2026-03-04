import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * 🚀 On-Demand Revalidation Controller
 * This endpoint allows the server (Admin Actions, Webhooks) to 
 * instantly purge specific static caches.
 * 
 * Usage: POST /api/revalidate?tag=tag-name&secret=YOUR_SECRET
 */
export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const path = searchParams.get('path');
    const secret = searchParams.get('secret');

    // 🛡️ Security Check: Prevent unauthorized cache purging
    if (secret !== process.env.REVALIDATION_SECRET) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    try {
        // Revalidation is handled with specialized 'page' scope for maximum precision
        if (tag) {
            revalidateTag(tag);
            console.log(`[REVALIDATE] Tag purged: ${tag}`);
        }

        if (path) {
            // Use 'page' type to ensure high-priority static refresh for 40,000 users
            revalidatePath(path, 'page');
            console.log(`[REVALIDATE] Path purged: ${path}`);
        }

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            target: tag || path
        });
    } catch (err) {
        console.error("Manual revalidation triggered error:", err);
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
    }
}
