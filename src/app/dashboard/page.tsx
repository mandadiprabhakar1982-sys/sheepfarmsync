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
    <div className="mobile-neural-screen flex flex-col h-full overflow-hidden p-0">
      <header className="shrink-0 px-5 pt-4 pb-10">
        <h1 className="text-[34px] font-[800] text-white tracking-tight leading-[1.1]">Mpr Hub</h1>
        <p className="text-[9px] font-black text-[#14d5c7] uppercase tracking-[0.3em] mt-1">Tactical Enterprise Node</p>
      </header>

      {/* CORRECT SOLUTION: FLEX-1 INTERNAL SCROLL AREA WITH BOTTOM CLEARANCE */}
      <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar">
        {/* PRIMARY NODE: FARM LEDGER */}
        <section className="mb-8">
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
        <section className="mb-10">
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
        <section className="mb-12">
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

        {/* ACTION TRIGGER */}
        <div className="mb-12">
          <Button onClick={() => router.push('/dashboard/expenses')} className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.2em] shadow-2xl text-xs gap-3">
            <Plus className="h-5 w-5 text-[#14d5c7]" /> Log Entry
          </Button>
        </div>
      </div>
    </div>
  );

  const HubCard = ({ item }: { item: any }) => {
    return (
      <Link href={item.href} className="group transition-all active:scale-95 block">
        <div className={cn("w-full h-[220px] rounded-[28px] p-5 flex flex-col items-center justify-center gap-6 relative overflow-hidden bg-white border border-[#D9D9D9] shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_25px_rgba(15,165,160,0.1)] group-hover:border-primary/30")}>
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", item.color)} />
          <div className="relative w-20 h-20 transition-transform group-hover:scale-110 duration-700 z-10 text-primary group-hover:text-white flex items-center justify-center">
            <item.icon className="w-full h-full" />
          </div>
          <div className="text-center relative z-10">
            <h3 className="text-[15px] font-black text-secondary-foreground tracking-widest leading-none mb-1 group-hover:text-white transition-colors">{item.title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] group-hover:text-white/60 transition-colors">{item.subtitle}</p>
          </div>
        </div>
      </Link>
    );
  };

  const hubItems = [
    { title: "Home", subtitle: "Main Control", icon: IconOverview, href: '/dashboard/overview', color: "from-primary/20 to-primary/40" },
    { title: "Daily Ledger", subtitle: "Farm Cost Audit", icon: IconFarmCost, href: '/dashboard/farm-ledger', color: "from-primary/20 to-primary/40" },
    { title: "Personal Finance", subtitle: "Unified Accounts", icon: IconLedger, href: '/dashboard/monthly-ledger', adminOnly: true, color: "from-primary/20 to-primary/40" },
    { title: "Debt & Loans", subtitle: "Debt Portfolio", icon: IconLiabilities, href: '/dashboard/balance-sheet', adminOnly: true, color: "from-primary/20 to-primary/40" },
    { title: "Sheep List", subtitle: "Flock Registry", icon: IconFlock, href: '/dashboard/livestock', color: "from-primary/20 to-primary/40" },
    { title: "Selling", subtitle: "Revenue Stream", icon: IconTrade, href: '/dashboard/sales', color: "from-primary/20 to-primary/40" },
    { title: "Medical", subtitle: "Clinical History", icon: IconHealth, href: '/dashboard/medicine', color: "from-primary/20 to-primary/40" },
    { title: "Fodder", subtitle: "Feed Inventory", icon: IconFeed, color: "from-primary/20 to-primary/40" },
    { title: "Labour", subtitle: "Staff & Coolie", icon: IconLabor, href: '/dashboard/labor', color: "from-primary/20 to-primary/40" },
    { title: "Expenses", subtitle: "Misc Overheads", icon: IconExpenses, href: '/dashboard/expenses', color: "from-primary/20 to-primary/40" },
  ];

  const WebDashboard = (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <div className="flex items-center gap-10 mb-20 mt-10">
        <HubSparkle className="h-24 w-24 shrink-0" />
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-secondary-foreground tracking-tighter leading-none">Executive <span className="text-primary">Control Hub</span></h1>
          <p className="text-[11px] font-black text-primary/60 uppercase tracking-[0.5em]">High-Density Management Infrastructure</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {hubItems.map((item, idx) => (item.adminOnly && !isAdmin ? null : <HubCard key={idx} item={item} />))}
      </div>
    </div>
  );

  return isMobile ? MobileHome : WebDashboard;
}
