'use client';

import { useState, useEffect } from 'react';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { useFarm } from '@/context/FarmContext';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  ReceiptIndianRupee, 
  Wheat, 
  Users, 
  Heart, 
  Wallet, 
  Plus,
  Loader2,
  ChevronRight,
  Zap,
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
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    totalFarmExpenses,
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
    <div 
      className="min-h-full -mx-4 bg-gradient-to-b from-[#0B2424] via-[#0F172A] to-[#020617] animate-in fade-in duration-1000 relative overflow-hidden"
      style={{ paddingLeft: '20px', paddingRight: '20px' }}
    >
      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-[-10%] -right-[20%] w-[80%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 -left-[20%] w-[80%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />

      {/* HEADER SECTION */}
      <header className="mb-10 relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center mt-[16px]">
            <Zap className="h-5 w-5 text-primary shadow-[0_0_15px_rgba(15,165,160,0.5)]" />
          </div>
          <div>
            <h1 className="text-[34px] font-[800] text-white tracking-tight leading-[1.1] mt-[16px]">Mpr Hub</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mt-1">Tactical Enterprise Node</p>
          </div>
        </div>
      </header>

      {/* PRIMARY NODE: FARM LEDGER (Center Anchor) */}
      <section className="mb-8 relative z-10">
        <Link href="/dashboard/farm-ledger">
          <div className="hub-node hub-glow-teal p-8 border-primary/20 group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30 text-primary">
                <IconFarmCost className="h-8 w-8" />
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-full p-2 text-white/40 group-hover:text-primary transition-colors">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Operational Audit</p>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-1">₹{totalExpenses.toLocaleString()}</h2>
              <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" /> System Audit Clear
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* FINANCIAL GRID (Floating Elements) */}
      <section className="mb-10 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/monthly-ledger" className="hub-node hub-glow-teal p-5">
            <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-4">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Inflow</p>
            <p className="text-lg font-black text-white tracking-tight">₹{totalCashInflow.toLocaleString()}</p>
          </Link>
          
          <Link href="/dashboard/sales" className="hub-node hub-glow-blue p-5">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Receivables</p>
            <p className="text-lg font-black text-white tracking-tight">₹{totalReceivables.toLocaleString()}</p>
          </Link>

          <Link href="/dashboard/purchase" className="hub-node hub-glow-orange p-5">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
              <TrendingDown className="h-5 w-5" />
            </div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Payables</p>
            <p className="text-lg font-black text-white tracking-tight">₹{totalPayables.toLocaleString()}</p>
          </Link>

          <Link href="/dashboard/overview" className="hub-node p-5">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 mb-4">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Matrix</p>
            <p className="text-lg font-black text-white tracking-tight">Overview</p>
          </Link>
        </div>
      </section>

      {/* CORE NODES (Interlocking) */}
      <section className="relative z-10">
        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 px-2">Sub-Process Systems</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Wheat, href: '/dashboard/feed', glow: 'hub-glow-teal' },
            { icon: Users, href: '/dashboard/labor', glow: 'hub-glow-teal' },
            { icon: Heart, href: '/dashboard/medicine', glow: 'hub-glow-teal' },
            { icon: Wallet, href: '/dashboard/expenses', glow: 'hub-glow-teal' },
          ].map((item, i) => (
            <Link key={i} href={item.href} className={cn("hub-node aspect-square flex items-center justify-center", item.glow)}>
              <item.icon className="h-6 w-6 text-white/60 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* ACTION TRIGGER */}
      <div className="mt-12 relative z-10">
        <Button onClick={() => router.push('/dashboard/expenses')} className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.2em] shadow-2xl text-xs gap-3">
          <Plus className="h-5 w-5 text-primary" /> Log Entry
        </Button>
      </div>
    </div>
  );

  const HubCard = ({ item }: { item: any }) => {
    return (
      <Link href={item.href} className="group transition-all active:scale-95 block">
        <div className="premium-card w-full h-[240px] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
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
    { title: "Fodder", subtitle: "Feed Inventory", icon: IconFeed, href: '/dashboard/feed', color: "from-primary/20 to-primary/40" },
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