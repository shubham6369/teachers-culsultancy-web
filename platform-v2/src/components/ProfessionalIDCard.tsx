"use client";

import React from "react";

interface IDCardProps {
    teacher: {
        fullName: string;
        regNumber: string;
        phone: string;
        subjects: string[];
        verification: string;
    };
}

export default function ProfessionalIDCard({ teacher }: IDCardProps) {
    return (
        <div className="w-[400px] h-[250px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col relative group select-none">
            {/* CARD ACCENT */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -translate-y-12 translate-x-12"></div>

            {/* HEADER */}
            <div className="bg-blue-600 p-4 shadow-lg flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">
                        <i className="fas fa-chalkboard-teacher"></i>
                    </div>
                    <span className="font-black tracking-tighter text-sm uppercase">TeachConnect</span>
                </div>
                <div className="px-2 py-0.5 bg-white/20 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">
                    Official Member
                </div>
            </div>

            {/* BODY */}
            <div className="flex-1 p-5 flex gap-5">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 shrink-0 flex items-center justify-center text-blue-600 text-3xl font-black border-4 border-slate-50 shadow-inner">
                    {teacher.fullName?.charAt(0) || "T"}
                </div>

                <div className="flex-1 space-y-3">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-tight">{teacher.fullName}</h2>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Certified Educator</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Reg No</p>
                            <p className="text-[10px] font-bold text-slate-700">{teacher.regNumber || 'TC-2024-0000'}</p>
                        </div>
                        <div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Contact</p>
                            <p className="text-[10px] font-bold text-slate-700">{teacher.phone}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Specialization</p>
                            <p className="text-[10px] font-bold text-slate-700">{(teacher.subjects || []).join(', ') || 'General'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="bg-slate-50 p-3 px-5 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-300">
                        <i className="fas fa-qrcode"></i>
                    </div>
                    <p className="text-[7px] text-slate-400 font-bold leading-tight uppercase tracking-widest">
                        Scan to verify <br /> authentic status
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                        {teacher.verification}
                    </p>
                </div>
            </div>
        </div>
    );
}
