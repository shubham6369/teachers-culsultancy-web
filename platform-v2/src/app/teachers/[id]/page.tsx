
import ProfessionalIDCard from "@/components/ProfessionalIDCard";
import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// ⏳ Revalidate profile data in background every 24 hours
export const revalidate = 86400;

/**
 * Pre-render top 200 "Elite" profiles at build time for instant access
 */
export async function generateStaticParams() {
    const snap = await adminDb.collection('users')
        .where('verification', '==', 'VERIFIED')
        .orderBy('pointsBalance', 'desc')
        .limit(200)
        .get();

    return snap.docs.map((doc: any) => ({
        id: doc.id,
    }));
}

/**
 * SEO Settings — Unique for every teacher
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const teacher = await getTeacherData(params.id);
    if (!teacher) return { title: 'Teacher Not Found' };

    return {
        title: `${teacher.fullName} | Expert ${teacher.subjects?.[0] || 'Teacher'} Profile`,
        description: `${teacher.fullName} is a verified educator on TeachConnect with ${teacher.experienceYears} years of experience in ${teacher.state}.`,
        openGraph: {
            type: 'profile',
            images: [teacher.profileImage || '/default-teacher.png'],
        },
    };
}

async function getTeacherData(id: string) {
    const doc = await adminDb.collection('users').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as any;
}

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
    const teacher = await getTeacherData(params.id);

    if (!teacher) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans text-slate-900">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* PROFILE CARD */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[500px]">
                    {/* Left (Profile Image/Basics) */}
                    <div className="md:w-5/12 bg-blue-600 p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-44 h-44 rounded-full border-8 border-white/20 bg-white flex items-center justify-center text-blue-600 text-7xl font-black mb-6 shadow-xl active:scale-[0.98] transition-transform cursor-pointer">
                            {teacher.fullName?.charAt(0) || "T"}
                        </div>
                        <h1 className="text-white text-3xl font-black leading-tight mb-2">
                            {teacher.fullName}
                        </h1>
                        <div className="px-5 py-2 bg-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            {teacher.verification}
                        </div>
                    </div>

                    {/* Right (Details) */}
                    <div className="md:w-7/12 p-12 space-y-10 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Subject Expert</p>
                                <p className="text-xl font-bold text-slate-800">{(teacher.subjects || []).join(', ') || 'General'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Experience</p>
                                <p className="text-xl font-bold text-slate-800">{teacher.experienceYears || 0} Years</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current State</p>
                                <p className="text-xl font-bold text-slate-800">{teacher.state || 'India'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Rewards Balance</p>
                                <p className="text-xl font-black text-blue-600">{(teacher.pointsBalance || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400 ml-1">Pts</span></p>
                            </div>
                        </div>

                        {/* Academic Background */}
                        <div className="p-8 bg-slate-50 rounded-4xl border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 relative z-10">
                                <i className="fas fa-graduation-cap text-blue-600"></i>
                                Academic Background
                            </h4>
                            <p className="text-slate-600 leading-relaxed text-sm relative z-10">
                                {teacher.fullName} is currently associated with {teacher.schoolName || 'a leading educational institution'}.
                                Their dedication to {teacher.subjects?.[0] || 'Education'} has earned them a {teacher.pointsBalance > 1000 ? 'Gold' : 'Silver'} category status on the TeachConnect Platform.
                            </p>
                        </div>
                    </div>
                </div>

                {/* DOWNLOAD CREDENTIALS & ID CARD PREVIEW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between h-full group">
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-blue-500 font-black text-2xl">
                                <i className="fas fa-certificate"></i>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Download Official Identity Credentials</h3>
                                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                                    Verified professional identity for recruitment and global leadership session entry.
                                </p>
                            </div>
                        </div>
                        <button className="mt-10 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-3">
                            Download High-Res PDF
                            <i className="fas fa-download text-[10px]"></i>
                        </button>
                    </div>

                    {/* ID CARD VISUAL PREVIEW */}
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Official Platform ID (Preview)</p>
                        <ProfessionalIDCard
                            teacher={{
                                fullName: teacher.fullName,
                                regNumber: teacher.regNumber || `TC-2024-${teacher.id.slice(-4)}`,
                                phone: teacher.phone,
                                subjects: teacher.subjects || [],
                                verification: teacher.verification
                            }}
                        />
                    </div>
                </div>

                {/* PROFILE METADATA FOOTER */}
                <div className="pt-12">
                    <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 leading-loose">
                        Professional profile verified by TeachConnect Authentication Engine. <br />
                        Last Synced: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>
    );
}
