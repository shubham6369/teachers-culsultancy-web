"use client";

import React, { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getPaginatedTeachers } from "@/lib/db";

const PAGE_SIZE = 25;

export default function TeacherList() {
    const parentRef = useRef<HTMLDivElement>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["teachers"],
        queryFn: ({ pageParam }) => getPaginatedTeachers(PAGE_SIZE, pageParam),
        initialPageParam: null as any,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastVisible : undefined,
    });

    const allRows = data ? data.pages.flatMap((d) => d.data) : [];

    const rowVirtualizer = useVirtualizer({
        count: hasNextPage ? allRows.length + 1 : allRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100, // Estimated height of each row
        overscan: 5,
    });

    useEffect(() => {
        const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

        if (!lastItem) return;

        if (
            lastItem.index >= allRows.length - 1 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }, [
        hasNextPage,
        fetchNextPage,
        allRows.length,
        isFetchingNextPage,
        rowVirtualizer.getVirtualItems(),
    ]);

    if (status === "pending") return <p>Loading teachers...</p>;
    if (status === "error") return <p>Error loading teachers.</p>;

    return (
        <div
            ref={parentRef}
            className="h-[600px] overflow-auto border rounded-xl bg-white shadow-lg"
            style={{ contain: "strict" }}
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const isLoaderRow = virtualRow.index > allRows.length - 1;
                    const teacher = allRows[virtualRow.index] as any;

                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="p-4 border-bottom flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            {isLoaderRow ? (
                                hasNextPage ? (
                                    "Loading more..."
                                ) : (
                                    "Nothing more to load"
                                )
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {teacher.name?.charAt(0) || "T"}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900">{teacher.name}</h4>
                                        <p className="text-sm text-slate-500">{teacher.subject} • {teacher.experience} Exp</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${teacher.verification === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {teacher.verification || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
