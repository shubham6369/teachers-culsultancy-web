import Image from 'next/image';
import { ArrowRight, Star, CheckCircle, Search, Menu, User } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-purple-200">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-tr from-purple-600 to-blue-500 rounded-lg shadow-lg flex items-center justify-center">
              <Star className="text-white w-5 h-5" />
            </div>
            <span id="brand-logo" className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 tracking-tight">
              Guru consultancy
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Services</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">About Us</a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Contact</a>
            <button id="login-btn" className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
              <User size={16} /> Sign In
            </button>
          </div>

          <button className="md:hidden text-slate-900"><Menu size={24} /></button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-widest shadow-sm">
              ✨ Welcome to Next Generation Learning
            </div>

            <h1 id="hero-title" className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Empower Your <span className="text-purple-600">Educational</span> Dreams.
            </h1>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Unlock your potential with our expert-led consultancy services tailored for students and educators worldwide. Simple, effective, and results-driven.
            </p>

            <div className="flex flex-wrap gap-4">
              <button id="cta-start" className="h-14 px-8 rounded-2xl bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                Get Started Now <ArrowRight size={20} />
              </button>
              <button id="cta-explore" className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all">
                Explore Services
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 shadow-sm" />
                ))}
              </div>
              <span>Trusted by 5,000+ Students</span>
            </div>
          </div>

          <div className="relative group lg:h-[600px] flex items-center justify-center">
            {/* Background Blob */}
            <div className="absolute -inset-4 bg-linear-to-tr from-purple-400 to-blue-400 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity" />

            <div className="relative rounded-[40px] border-8 border-white shadow-2xl overflow-hidden animate-float">
              <Image
                src="/hero.png"
                alt="Educational Consultant Banner"
                width={800}
                height={600}
                className="object-cover h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
            <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Verified Experts</h3>
            <p className="text-slate-500 text-sm">Consultants with decades of experience in high-tier academia.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">5-Star Reviews</h3>
            <p className="text-slate-500 text-sm">Consistently rated as top choice for educational strategy.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
            <Search className="w-12 h-12 text-purple-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tailored Research</h3>
            <p className="text-slate-500 text-sm">Deep analysis to find the perfect individual path for you.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="text-2xl font-bold tracking-tighter">GURU.</div>
          <p className="text-slate-400 text-sm text-center max-w-sm">
            Empowering students to build the future of education together. Dedicated to quality and fairness.
          </p>
          <div className="flex gap-8 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 w-full text-center text-slate-500 text-xs">
            © 2026 GURU Consultancy Services. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
