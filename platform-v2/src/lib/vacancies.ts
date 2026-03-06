import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Handle new teaching vacancy posting
 * Triggers instant revalidation for 1 Lakh+ teachers.
 */
export async function postVacancyAction(schoolId: string, vacancyData: any) {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    const vacancyId = `vac_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const vacancyRef = adminDb.collection('vacancies').doc(vacancyId);

    // We update stats and the vacancy itself in one atomic operation
    const batch = adminDb.batch();
    const statsRef = adminDb.collection('counters').doc('stats');

    const newVacancy = {
        ...vacancyData,
        id: vacancyId,
        schoolId,
        status: 'open',
        applicantCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };

    batch.set(vacancyRef, newVacancy);

    // Update global "Open Vacancies" counter instantly
    batch.update(statsRef, {
        totalVacancies: FieldValue.increment(1),
        openVacancies: FieldValue.increment(1),
    });

    await batch.commit();

    // ⚡ On-Demand Revalidation (Instant Global Purge)
    try {
        // Refresh the public landing page (where "Latest Vacancies" are shown)
        revalidatePath('/public');

        // Refresh the main vacancies listing page
        revalidatePath('/vacancies');

        // Purge any caches tagged with 'vacancies'
        revalidateTag('vacancies-list', 'max');

        console.log(`[REVALIDATE] Vacancy ${vacancyId} is now live and purged from all caches.`);
    } catch (e) {
        console.error("Revalidation trigger failed, but database update succeeded.", e);
    }

    return {
        success: true,
        id: vacancyId,
        timestamp: new Date().toISOString()
    };
}

/**
 * Handle vacancy closure (filled/removed)
 * Triggers instant removal from caches
 */
export async function closeVacancyAction(vacancyId: string) {
    const vacancyRef = adminDb.collection('vacancies').doc(vacancyId);
    const statsRef = adminDb.collection('counters').doc('stats');

    const batch = adminDb.batch();
    batch.update(vacancyRef, {
        status: 'closed',
        updatedAt: FieldValue.serverTimestamp(),
    });

    batch.update(statsRef, {
        openVacancies: FieldValue.increment(-1),
    });

    await batch.commit();

    // ⚡ On-Demand Revalidation
    try {
        revalidatePath('/public');
        revalidatePath('/vacancies');
        revalidateTag('vacancies-list', 'max');
    } catch (e) {
        console.error("Closure revalidation failed.", e);
    }

    return { success: true };
}
