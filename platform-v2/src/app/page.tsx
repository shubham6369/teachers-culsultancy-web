import TeacherList from "@/components/TeacherList";
import VerificationQueue from "@/components/VerificationQueue";
import RewardsLeaderboard from "@/components/RewardsLeaderboard";
import CertificateStatus from "@/components/CertificateStatus";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
          TeachConnect <span className="text-blue-600">Admin Pro</span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Scalability V2: Seamlessly managing <span className="text-blue-600 font-bold">1 Lakh+ Teachers</span>.
          Powered by Virtualization, Edge Caching, and Background Workers.
        </p>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        {/* TOP ROW: STATS & TOOLS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between">
            <div>
              <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-1">Total Scale Capacity</p>
              <h3 className="text-4xl font-black text-slate-900">500,000</h3>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm text-slate-500 font-medium">Auto-scaling Active</span>
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-3xl shadow-xl text-white flex flex-col justify-between">
            <div>
              <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">Daily Active Load</p>
              <h3 className="text-4xl font-black">40,000+</h3>
            </div>
            <p className="text-sm text-blue-100 mt-2">Zero-lag database cursor technology.</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl text-white flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">BG Worker Status</p>
                <h3 className="text-xl font-bold text-emerald-400">Operational</h3>
              </div>
              <i className="fas fa-server text-slate-700 text-2xl"></i>
            </div>
            <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all">
              View Queue Metrics
            </button>
          </div>
        </section>

        {/* MIDDLE ROW: QUEUES & LEADERBOARD */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">
                <i className="fas fa-user-check"></i>
              </span>
              Verification
            </h2>
            <VerificationQueue />
          </div>

          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-sm">
                <i className="fas fa-file-pdf"></i>
              </span>
              Task Monitor
            </h2>
            <CertificateStatus />
          </div>

          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                <i className="fas fa-star"></i>
              </span>
              Leaderboard
            </h2>
            <RewardsLeaderboard />
          </div>
        </section>

        {/* BOTTOM SECTION: GLOBAL FEED */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                <i className="fas fa-users"></i>
              </span>
              Global Teacher Repository
            </h2>
            <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">Virtualizer: Optimized</span>
          </div>
          <TeacherList />
        </section>
      </main>
    </div>
  );
}
