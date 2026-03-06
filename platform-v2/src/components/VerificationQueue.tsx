"use client";

import React, { useRef, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";

const PAGE_SIZE = 25;

async function getPendingTeachers(pageSize = 25, lastDoc = null) {
    let q = query(
        collection(db, 'users'),
        where('verification', '==', 'PENDING'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
    );
    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snap = await getDocs(q);
    return {
        data: snap.docs.map((d: any) => ({ id: d.id, ...d.data() })),
        lastVisible: snap.docs[snap.docs.length - 1],
        hasMore: snap.docs.length === pageSize
    };
}

export default function VerificationQueue() {
    const queryClient = useQueryClient();
    const parentRef = useRef<HTMLDivElement>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["pending-teachers"],
        queryFn: ({ pageParam }: { pageParam: any }) => getPendingTeachers(PAGE_SIZE, pageParam),
        initialPageParam: null as any,
        getNextPageParam: (lastPage: any) => lastPage.hasMore ? lastPage.lastVisible : undefined,
    });

    const allRows = data ? data.pages.flatMap((d: any) => d.data) : [];

    const rowVirtualizer = useVirtualizer({
        count: hasNextPage ? allRows.length + 1 : allRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 120,
        overscan: 5,
    });

    const mutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'VERIFIED' | 'REJECTED' }) => {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ teacherId: id, status }),
            });
            if (!res.ok) throw new Error('Verification failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-teachers"] });
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
        }
    });

    useEffect(() => {
        const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
        if (lastItem && lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);

    return (
        <div ref={parentRef} className="h-[600px] overflow-auto border rounded-2xl bg-white shadow-xl">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
                    const isLoaderRow = virtualRow.index > allRows.length - 1;
                    const teacher: any = allRows[virtualRow.index];

                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: "absolute", top: 0, left: 0, width: "100%", height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="p-6 border-b flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            {isLoaderRow ? (
                                <div className="text-center w-full text-slate-400">Loading more...</div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                                            {teacher.fullName?.charAt(0) || "T"}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{teacher.fullName}</h4>
                                            <p className="text-sm text-slate-500">{teacher.schoolName} • {teacher.experienceYears} Years Exp</p>
                                            <p className="text-xs text-blue-500 mt-1 font-medium">Applied: {new Date(teacher.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => mutation.mutate({ id: teacher.id, status: 'VERIFIED' })}
                                            disabled={mutation.isPending}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => mutation.mutate({ id: teacher.id, status: 'REJECTED' })}
                                            disabled={mutation.isPending}
                                            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
