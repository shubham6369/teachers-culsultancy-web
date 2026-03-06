import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Handle individual teacher verification
 */
export async function verifyTeacherAction(teacherId: string, status: 'VERIFIED' | 'REJECTED') {
    const batch = adminDb.batch();
    const userRef = adminDb.collection('users').doc(teacherId);
    const statsRef = adminDb.collection('counters').doc('stats');

    batch.update(userRef, {
        verification: status,
        updatedAt: FieldValue.serverTimestamp(),
    });

    if (status === 'VERIFIED') {
        const points = 200;
        batch.update(userRef, {
            pointsBalance: FieldValue.increment(points)
        });

        const rewardRef = userRef.collection('rewards').doc();
        batch.set(rewardRef, {
            points,
            type: 'EARN',
            reason: 'Verification Approved',
            createdAt: FieldValue.serverTimestamp(),
        });

        const rewardsStatsRef = adminDb.collection('counters').doc('rewards');
        batch.set(rewardsStatsRef, {
            totalEarned: FieldValue.increment(points),
            totalTransactions: FieldValue.increment(1),
        }, { merge: true });
    }

    batch.update(statsRef, {
        pending: FieldValue.increment(-1),
        [status.toLowerCase()]: FieldValue.increment(1),
    });

    await batch.commit();

    // ⚡ On-Demand Revalidation (Instant Purge)
    try {
        revalidatePath('/public', 'page');
        revalidatePath(`/teachers/${teacherId}`, 'page');
        revalidateTag('public-data', 'max');
    } catch (e) {
        console.error("Revalidation failed:", e);
    }

    return { success: true };
}

/**
 * Manual points awarding
 */
export async function awardPointsAction(teacherId: string, points: number, reason: string) {
    const batch = adminDb.batch();
    const userRef = adminDb.collection('users').doc(teacherId);

    batch.update(userRef, {
        pointsBalance: FieldValue.increment(points),
        updatedAt: FieldValue.serverTimestamp(),
    });

    const rewardRef = userRef.collection('rewards').doc();
    batch.set(rewardRef, {
        points,
        type: points > 0 ? 'EARN' : 'REDEEM',
        reason,
        createdAt: FieldValue.serverTimestamp(),
    });

    const rewardsStatsRef = adminDb.collection('counters').doc('rewards');
    batch.set(rewardsStatsRef, {
        [points > 0 ? 'totalEarned' : 'totalRedeemed']: FieldValue.increment(Math.abs(points)),
        totalTransactions: FieldValue.increment(1),
    }, { merge: true });

    await batch.commit();

    // ⚡ On-Demand Revalidation
    try {
        revalidatePath(`/teachers/${teacherId}`, 'page');
        revalidatePath('/public', 'page');
    } catch (e) {
        console.error("Revalidation failed:", e);
    }

    return { success: true };
}

/**
 * Trigger background certificate generation
 * No longer needs BullMQ/Redis Jobs.
 * Handled by Fireabase Functions triggered by 'global_certificate_logs'
 */
export async function requestCertificateAction(teacherId: string, teacherName: string, type: string) {
    const batch = adminDb.batch();

    // 1. Log request in Teacher's private folder
    const teacherReqRef = adminDb.collection('users').doc(teacherId).collection('certificate_requests').doc();
    batch.set(teacherReqRef, {
        type,
        status: 'QUEUED',
        requestedAt: FieldValue.serverTimestamp(),
    });

    // 2. Log to Global Index (for Admin Dashboard View & Cloud Function Trigger)
    const globalLogRef = adminDb.collection('global_certificate_logs').doc();
    batch.set(globalLogRef, {
        teacherId,
        teacherName,
        type,
        status: 'QUEUED',
        requestedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return { success: true, message: 'Certificate generation queued in background.' };
}
