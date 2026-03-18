'use client';

import { useState, useEffect } from 'react';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { useFarm } from '@/context/FarmContext';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  Wheat, 
  Users, 
  Heart, 
  Wallet, 
  Plus,
  Loader2,
  ChevronRight,
  ArrowUpCircle,
  LayoutGrid,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  HubSparkle,
  IconOverview,
  IconLedger,
  IconLiabilities,
  IconFlock,
  IconTrade,
  IconHealth,
  IconFeed,
  IconLabor,
  IconExpenses,
  IconFarmCost
} from '@/components/logo';

export default function DashboardPage() {
  const { width, isHydrated } = useWindowDimensions();
  const router = useRouter();
  
  const { 
    userRole, 
    totalExpenses, 
    totalReceivables, 
    totalPayables, 
    totalCashInflow,
    isLoading
  } = useFarm();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isHydrated || (isLoading && !userRole)) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initializing Hub Protocol...</p>
        </div>
      </div>
    );
  }

  const isMobile = width < 768;
  const isAdmin = userRole === 'admin';

  const MobileHome = (
    <div className="flex-1 overflow-y-auto pb-32">
      <header className="px-5 pt-4 pb-10">
        <h1 className="text-[34px] font-[800] text-white tracking-tight leading-[1.1]">Mpr Hub</h1>
        <p className="text-[9px] font-black text-[#14d5c7] uppercase tracking-[0.3em] mt-1">Tactical Enterprise Node</p>
      </header>

      {/* PRIMARY NODE: FARM LEDGER */}
      <section className="px-5 mb-8">
        <Link href="/dashboard/farm-ledger">
          <div className="hub-node hub-glow-teal p-5 h-[220px] rounded-[28px] border-white/5 bg-white/5 group flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-[#14d5c7]/20 border border-[#14d5c7]/30 text-[#14d5c7]">
                <IconFarmCost className="h-8 w-8" />
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-full p-2 text-white/40 group-hover:text-[#14d5c7] transition-colors">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Operational Audit</p>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-1">₹{totalExpenses.toLocaleString()}</h2>
              <div className="flex items-center gap-2 text-[9px] font-bold text-[#14d5c7] uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" /> System Audit Clear
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* FINANCIAL GRID */}
      <section className="px-5 mb-10">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/monthly-ledger" className="hub-node hub-glow-teal p-5 h-[220px] rounded-[28px] flex flex-col justify-between bg-white/5">
            <div className="h-10 w-10 rounded-xl bg-[#14d5c7]/20 border border-[#14d5c7]/30 flex items-center justify-center text-[#14d5c7]">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Inflow</p>
              <p className="text-lg font-black text-white tracking-tight">₹{totalCashInflow.toLocaleString()}</p>
            </div>
          </Link>
          
          <Link href="/dashboard/sales" className="hub-node hub-glow-blue p-5 h-[220px] rounded-[28px] flex flex-col justify-between bg-white/5">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Receivables</p>
              <p className="text-lg font-black text-white tracking-tight">₹{totalReceivables.toLocaleString()}</p>
            </div>
          </Link>

          <Link href="/dashboard/purchase" className="hub-node hub-glow-orange p-5 h-[220px] rounded-[28px] flex flex-col justify-between bg-white/5">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Payables</p>
              <p className="text-lg font-black text-white tracking-tight">₹{totalPayables.toLocaleString()}</p>
            </div>
          </Link>

          <Link href="/dashboard/overview" className="hub-node p-5 h-[220px] rounded-[28px] flex flex-col justify-between bg-white/5">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Matrix</p>
              <p className="text-lg font-black text-white tracking-tight">Overview</p>
            </div>
          </Link>
        </div>
      </section>

      {/* CORE NODES */}
      <section className="px-5 mb-12">
        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 px-2">Sub-Process Systems</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Wheat, href: '/dashboard/feed', label: 'Fodder' },
            { icon: Users, href: '/dashboard/labor', label: 'Labour' },
            { icon: Heart, href: '/dashboard/medicine', label: 'Medical' },
            { icon: Wallet, href: '/dashboard/expenses', label: 'Expenses' },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="hub-node h-[120px] p-5 flex flex-col justify-between rounded-[20px] bg-white/5">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-white/60 group-hover:text-[#14d5c7] transition-colors" />
              </div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* MOBILE FAB ACTION */}
      <button 
        onClick={() => router.push('/dashboard/expenses')}
        className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-[#14d5c7] text-[#020617] shadow-[0_0_30px_rgba(20,213,199,0.4)] flex items-center justify-center active:scale-90 transition-all z-30"
      >
        <Plus className="h-8 w-8 stroke-[3px]" />
      </button>
    </div>
  );

  const WebDashboard = (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-20 px-4 md:px-0 overflow-y-auto h-full no-scrollbar">
      <div className="flex items-center gap-10 mb-20 mt-10">
        <HubSparkle className="h-24 w-24 shrink-0" />
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-secondary-foreground tracking-tighter leading-none">Executive <span className="text-primary">Control Hub</span></h1>
          <p className="text-[11px] font-black text-primary/60 uppercase tracking-[0.5em]">High-Density Management Infrastructure</p>
        </div>
      </div>
      {/* GRID REMOVED PER USER REQUEST */}
    </div>
  );

  return isMobile ? MobileHome : WebDashboard;
}
