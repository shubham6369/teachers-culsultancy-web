"use client";

import React from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";

interface CertificateRequest {
    id: string;
    teacherName: string;
    type: string;
    status: string;
    requestedAt: any;
}

export default function CertificateStatus() {
    const [requests, setRequests] = React.useState<CertificateRequest[]>([]);

    React.useEffect(() => {
        // Listen to global certificate requests (Admin view)
        const q = query(
            collection(db, "global_certificate_logs"),
            orderBy("requestedAt", "desc"),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CertificateRequest));
            setRequests(data);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden text-slate-900">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <i className="fas fa-file-pdf text-red-500"></i>
                    Recent Certificates
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Worker Stats</span>
            </div>

            <div className="divide-y divide-slate-50">
                {requests.length > 0 ? requests.map((req) => (
                    <div key={req.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600 animate-pulse'
                                }`}>
                                <i className={`fas ${req.status === 'COMPLETED' ? 'fa-check-circle' : 'fa-spinner fa-spin'}`}></i>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{req.teacherName}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase">{req.type} • {req.id.slice(0, 8)}</p>
                            </div>
                        </div>

                        {req.status === 'COMPLETED' ? (
                            <button className="text-blue-600 hover:text-blue-800 p-2 transition-colors">
                                <i className="fas fa-download"></i>
                            </button>
                        ) : (
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Processing</span>
                        )}
                    </div>
                )) : (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <i className="fas fa-file-invoice"></i>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">No active generation tasks</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-900 text-center">
                <button className="text-white text-xs font-bold hover:underline">View All Task Logs →</button>
            </div>
        </div>
    );
}
