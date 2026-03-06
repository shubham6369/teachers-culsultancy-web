import { NextResponse } from 'next/server';
import { verifyTeacherAction } from '@/lib/admin';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        // 🛡️ Security: Check for Admin Auth
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!adminAuth) {
            return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        if (decodedToken.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { teacherId, status } = await req.json();

        if (!teacherId || !['VERIFIED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const result = await verifyTeacherAction(teacherId, status);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('API Verify Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
