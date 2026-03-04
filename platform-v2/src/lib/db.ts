import { db } from './firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

/**
 * Scalable Pagination Service
 * Never uses offset-based skips. Always uses cursor (startAfter).
 * Optimized for 40,000 daily users.
 */
export async function getPaginatedTeachers(pageSize = 25, lastDoc: QueryDocumentSnapshot<DocumentData> | null = null) {
    try {
        let q = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);

        // Explicitly typed 'doc' to resolve TypeScript 'any' warnings
        const data = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            data,
            lastVisible: snapshot.docs[snapshot.docs.length - 1],
            hasMore: snapshot.docs.length === pageSize
        };
    } catch (error) {
        console.error("Error fetching teachers:", error);
        throw error;
    }
}
