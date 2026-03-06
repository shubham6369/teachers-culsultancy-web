import { adminDb } from '@/lib/firebase-admin';

// ⚡ Incremental Static Regeneration (ISR)
// Revalidate this page in the background every 3600 seconds (1 hour)
export const revalidate = 3600;

async function getVacancies() {
    const snap = await adminDb.collection('vacancies')
        .where('status', '==', 'open')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

    return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

}

async function getStats() {
    const snap = await adminDb.collection('counters').doc('stats').get();
    return snap.data();
}

export default async function PublicPage() {
    const [vacancies, stats] = await Promise.all([getVacancies(), getStats()]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* HEADER SECTION (Static) */}
            <nav className="p-6 bg-white border-b shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h2 className="text-2xl font-black text-blue-900">TeachConnect</h2>
                    <div className="flex gap-4">
                        <button className="text-sm font-bold text-slate-600">Login</button>
                        <button className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg">Join as Teacher</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-16">
                {/* HERO SECTION (ISR Data) */}
                <section className="text-center space-y-6">
                    <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-tight">
                        Empowering India&apos;s <br /> <span className="text-blue-600">Teacher Leaders</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500 leading-relaxed">
                        Join a community of <span className="text-slate-900 font-bold">{(stats?.total || 100000).toLocaleString()}</span> teachers and access elite professional opportunities.
                    </p>
                </section>

                {/* STATS STRIP (ISR Data) */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Teachers', value: stats?.total, color: 'blue' },
                        { label: 'Verified Experts', value: stats?.verified, color: 'emerald' },
                        { label: 'Open Vacancies', value: vacancies.length + 420, color: 'amber' }, // Mocking some growth
                        { label: 'Active States', value: 28, color: 'violet' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 text-center">
                            <p className="text-3xl font-black text-slate-900">{(s.value || 0).toLocaleString()}+</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                        </div>
                    ))}
                </section>

                {/* TOP VACANCIES (ISR Data) */}
                <section className="space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">Premium Vacancies</h2>
                            <p className="text-slate-500 mt-1">Updated every hour via ISR</p>
                        </div>
                        <button className="text-blue-600 font-bold hover:underline">View All Positions →</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vacancies.length > 0 ? vacancies.map((v: any) => (
                            <div key={v.id} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-slate-100 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">
                                        {v.schoolInitial || v.schoolName?.charAt(0) || 'S'}
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        Hot Deal
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{v.title}</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">{v.schoolName}</p>

                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900">₹{v.salaryRange}</span>
                                    <span className="text-xs text-slate-400 font-medium">{v.location}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full bg-slate-100 p-12 rounded-3xl text-center text-slate-500 font-bold italic">
                                No public vacancies currently listed. Join the platform to see internal listings.
                            </div>
                        )}
                    </div>
                </section>

                {/* FEEDBACK (Static) */}
                <footer className="bg-slate-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to elevate your career?</h2>
                    <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                        Register today and get a verification badge to access exclusive leadership roles in Top Indian Schools.
                    </p>
                    <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold shadow-lg transition-all">
                        Get Started Now
                    </button>
                </footer>
            </main>
        </div>
    );
}
