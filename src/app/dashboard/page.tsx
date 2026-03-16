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
  ArrowUpCircle
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

/**
 * @fileOverview Farm Executive Control Hub (Standard Indian English)
 */
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { width } = useWindowDimensions();
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

  // Handle Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // We only block the render if the critical profile data is still loading
  if (!mounted || (isLoading && !userRole)) {
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

  // --- MOBILE HUB ---
  const MobileHome = (
    <div className="max-w-lg mx-auto animate-in fade-in duration-500 dashboard-stack pb-24">
      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Financial Summary</h2>
        <div className="space-y-4">
          <Link href="/dashboard/monthly-ledger" className="block">
            <div className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-emerald-600"><ArrowUpCircle className="h-6 w-6" /></div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Total Cash Inflow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-emerald-600">₹{totalCashInflow.toLocaleString()}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </Link>
          <Link href="/dashboard/sales" className="block">
            <div className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-blue-500"><TrendingUp className="h-6 w-6" /></div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Receivables</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-slate-900">₹{totalReceivables.toLocaleString()}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </Link>
          <Link href="/dashboard/purchase" className="block">
            <div className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-[#f59e0b]"><TrendingDown className="h-6 w-6" /></div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Payables</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-slate-900">₹{totalPayables.toLocaleString()}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Operational Audit</h2>
        
        {/* FARM LEDGER ACTION CARD */}
        <div className="mb-6 px-2">
          <Link href="/dashboard/farm-ledger">
            <div className="bg-emerald-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden active:scale-[0.98] transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <IconFarmCost className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight uppercase leading-none">Daily Farm Ledger</h3>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mt-1">Operational Cost Center</p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest">Total Farm Spend</p>
                    <p className="text-3xl font-black tracking-tighter">₹{totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="bg-accent rounded-full p-2 text-black shadow-lg">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Fodder', val: totalFeedCost, icon: Wheat, href: '/dashboard/feed' },
            { label: 'Labour', val: totalLaborCost, icon: Users, href: '/dashboard/labor' },
            { label: 'Medical', val: totalMedicineCost, icon: Heart, href: '/dashboard/medicine' },
            { label: 'Expenses', val: totalFarmExpenses, icon: Wallet, href: '/dashboard/expenses' },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="bg-white rounded-[2rem] p-6 flex flex-col items-center text-center shadow-sm border border-slate-100 aspect-square justify-center active:scale-[0.98] transition-all">
              <div className="h-16 w-16 rounded-[1.5rem] bg-[#f59e0b] flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
                <item.icon className="h-8 w-8" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}:</p>
              <p className="text-xl font-black tracking-tighter text-slate-900">₹{item.val.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="pt-4 px-2">
        <Button onClick={() => router.push('/dashboard/expenses')} className="w-full h-16 rounded-2xl bg-neutral-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] shadow-xl text-sm gap-3 border-none">
          <Plus className="h-6 w-6 text-accent" /> LOG MISC EXPENSE
        </Button>
      </div>
    </div>
  );

  // --- WEB HUB ---
  const HubCard = ({ item }: { item: any }) => {
    return (
      <Link href={item.href} className="group transition-all active:scale-95 block">
        <div className="w-full h-[240px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 shadow-xl hover:shadow-[0_20px_60px_rgba(6,78,59,0.15)] transition-all hover:-translate-y-1 border border-white relative overflow-hidden glass-sheen">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", item.color)} />
          <div className="relative w-20 h-20 transition-transform group-hover:scale-110 duration-700 z-10 text-primary group-hover:text-white flex items-center justify-center">
            <item.icon className="w-full h-full" />
          </div>
          <div className="text-center relative z-10">
            <h3 className="text-[15px] font-black text-slate-900 tracking-widest leading-none mb-1 uppercase group-hover:text-white transition-colors">{item.title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] group-hover:text-accent transition-colors">{item.subtitle}</p>
          </div>
        </div>
      </Link>
    );
  };

  const hubItems = [
    { title: "SUMMARY", subtitle: "EXECUTIVE REPORT", icon: IconOverview, href: '/dashboard/overview', color: "from-emerald-950/40 to-emerald-900/40" },
    { title: "DAILY LEDGER", subtitle: "FARM COST AUDIT", icon: IconFarmCost, href: '/dashboard/farm-ledger', color: "from-amber-950/40 to-amber-900/40" },
    { title: "FINANCE", subtitle: "UNIFIED ACCOUNTS", icon: IconLedger, href: '/dashboard/monthly-ledger', adminOnly: true, color: "from-emerald-900/40 to-emerald-800/40" },
    { title: "DEBT & LOANS", subtitle: "DEBT PORTFOLIO", icon: IconLiabilities, href: '/dashboard/balance-sheet', adminOnly: true, color: "from-amber-900/40 to-amber-800/40" },
    { title: "SHEEP LIST", subtitle: "FLOCK REGISTRY", icon: IconFlock, href: '/dashboard/livestock', color: "from-emerald-800/40 to-emerald-700/40" },
    { title: "SELLING", subtitle: "REVENUE STREAM", icon: IconTrade, href: '/dashboard/sales', color: "from-emerald-700/40 to-emerald-600/40" },
    { title: "MEDICAL", subtitle: "CLINICAL HISTORY", icon: IconHealth, href: '/dashboard/medicine', color: "from-red-900/40 to-red-800/40" },
    { title: "FODDER", subtitle: "FEED INVENTORY", icon: IconFeed, href: '/dashboard/feed', color: "from-emerald-600/40 to-emerald-500/40" },
    { title: "LABOUR", subtitle: "STAFF & COOLIE", icon: IconLabor, href: '/dashboard/labor', color: "from-slate-900/40 to-slate-800/40" },
    { title: "EXPENSES", subtitle: "MISC OVERHEADS", icon: IconExpenses, href: '/dashboard/expenses', color: "from-slate-800/40 to-slate-700/40" },
  ];

  const WebDashboard = (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <div className="flex items-center gap-10 mb-20 mt-10">
        <HubSparkle className="h-24 w-24 shrink-0" />
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">EXECUTIVE <span className="text-primary">CONTROL HUB</span></h1>
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
