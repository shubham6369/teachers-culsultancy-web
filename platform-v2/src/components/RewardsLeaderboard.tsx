"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

async function getTopTeachers() {
    const q = query(
        collection(db, 'users'),
        orderBy('pointsBalance', 'desc'),
        limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export default function RewardsLeaderboard() {
    const { data: users, status } = useQuery({
        queryKey: ["top-teachers"],
        queryFn: getTopTeachers,
    });

    if (status === "pending") return <div className="p-8 text-center text-slate-500">Loading Leaderboard...</div>;
    if (status === "error") return <div className="p-8 text-center text-rose-500">Error loading leaderboard.</div>;

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-4 px-6 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2">
                    <i className="fas fa-trophy text-amber-400"></i>
                    Top 50 Education Leaders
                </h3>
                <span className="text-xs bg-white/10 px-2 py-1 rounded">Real-time</span>
            </div>
            <div className="max-h-[500px] overflow-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 sticky top-0 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4 text-center">Rank</th>
                            <th className="p-4">Name</th>
                            <th className="p-4 text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users?.map((u: any, i) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-4 text-center font-bold text-slate-400 group-hover:text-amber-600 transition-colors">
                                    {i + 1}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {u.fullName?.charAt(0) || "T"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{u.fullName}</p>
                                            <p className="text-[10px] text-slate-400">{u.state}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <span className="font-black text-blue-600">{(u.pointsBalance || 0).toLocaleString()}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
