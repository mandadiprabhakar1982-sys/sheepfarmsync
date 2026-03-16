'use client';

import { useIsMobile } from '@/hooks/use-mobile';
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
  ShieldCheck,
  ChevronRight
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
  IconExpenses
} from '@/components/logo';

/**
 * @fileOverview Gatekeeper Page: Dispatches between Web Dashboard and Mobile App Model
 * This acts as the "Logic Gate" described in the Responsive Routing Strategy.
 */
export default function DashboardPage() {
  const isMobile = useIsMobile();
  const { 
    userRole, 
    totalExpenses, 
    totalReceivables, 
    totalPayables, 
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    totalFarmExpenses,
    isLoading 
  } = useFarm();
  const router = useRouter();

  // GATEKEEPER LOADING STATE: Prevents UI flickering during device detection
  if (isLoading || isMobile === undefined) {
    return (
      <div className="flex h-[calc(100vh-180px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Dispatching Command Hub</p>
        </div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  // --- MODEL A: MOBILE APP (STREAMLINED FINANCIAL VIEW) ---
  const FinancialRow = ({ title, value, icon: Icon, color, href }: { title: string, value: string, icon: any, color: string, href: string }) => (
    <Link href={href} className="block w-full">
      <div className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 mb-4 active:scale-[0.98] transition-all">
        <div className="flex items-center gap-4">
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md", color)}>
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-slate-900">{value}</span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </div>
      </div>
    </Link>
  );

  const BreakdownCard = ({ title, value, icon: Icon, href }: { title: string, value: string, icon: any, href: string }) => (
    <Link href={href} className="block aspect-square">
      <div className="bg-white rounded-[2rem] p-6 flex flex-col items-center text-center shadow-sm border border-slate-100 h-full justify-center active:scale-[0.98] transition-all">
        <div className="h-16 w-16 rounded-[1.5rem] bg-[#f59e0b] flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
          <Icon className="h-8 w-8" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}:</p>
        <p className="text-xl font-black tracking-tighter text-slate-900">{value}</p>
      </div>
    </Link>
  );

  const MobileHome = (
    <div className="max-w-lg mx-auto space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Financial Summary</h2>
        <div className="space-y-1">
          <FinancialRow 
            title="Receivables Pending" 
            value={`₹${totalReceivables.toLocaleString()}`} 
            icon={TrendingUp} 
            color="bg-blue-500"
            href="/dashboard/sales"
          />
          <FinancialRow 
            title="Payables Due" 
            value={`₹${totalPayables.toLocaleString()}`} 
            icon={TrendingDown} 
            color="bg-[#f59e0b]"
            href="/dashboard/purchase"
          />
          <FinancialRow 
            title="Total Cost Summary" 
            value={`₹${totalExpenses.toLocaleString()}`} 
            icon={ReceiptIndianRupee} 
            color="bg-slate-800"
            href="/dashboard/monthly-ledger"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Operational Breakdown</h2>
        <div className="grid grid-cols-2 gap-4">
          <BreakdownCard title="Feed Usage" value={`₹${totalFeedCost.toLocaleString()}`} icon={Wheat} href="/dashboard/feed" />
          <BreakdownCard title="Labor Cost" value={`₹${totalLaborCost.toLocaleString()}`} icon={Users} href="/dashboard/labor" />
          <BreakdownCard title="Medical" value={`₹${totalMedicineCost.toLocaleString()}`} icon={Heart} href="/dashboard/medicine" />
          <BreakdownCard title="Misc. Expenses" value={`₹${totalFarmExpenses.toLocaleString()}`} icon={Wallet} href="/dashboard/expenses" />
        </div>
      </section>

      <div className="pt-4 pb-10">
        <Button 
          onClick={() => router.push('/dashboard/expenses')}
          className="w-full h-16 rounded-2xl bg-[#f59e0b] hover:bg-amber-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 text-sm gap-3 border-none"
        >
          <Plus className="h-6 w-6" />
          Record Expense
        </Button>
      </div>
    </div>
  );

  // --- MODEL B: WEB DASHBOARD (HIGH-DENSITY GRID) ---
  const HubCard = ({ item }: { item: any }) => (
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

  const hubItems = [
    { title: "OVERVIEW", subtitle: "ANALYTICS", icon: IconOverview, href: '/dashboard/overview', color: "from-emerald-950/40 to-emerald-900/40" },
    { title: "LEDGER", subtitle: "BALANCE SHEET", icon: IconLedger, href: '/dashboard/monthly-ledger', adminOnly: true, color: "from-emerald-900/40 to-emerald-800/40" },
    { title: "DEBT", subtitle: "PORTFOLIO", icon: IconLiabilities, href: '/dashboard/balance-sheet', adminOnly: true, color: "from-amber-900/40 to-amber-800/40" },
    { title: "FLOCK", subtitle: "LIVESTOCK", icon: IconFlock, href: '/dashboard/livestock', color: "from-emerald-800/40 to-emerald-700/40" },
    { title: "TRADE", subtitle: "BUY & SELL", icon: IconTrade, href: '/dashboard/sales', color: "from-emerald-700/40 to-emerald-600/40" },
    { title: "HEALTH", subtitle: "CLINICAL", icon: IconHealth, href: '/dashboard/medicine', color: "from-red-900/40 to-red-800/40" },
    { title: "FEED", subtitle: "INVENTORY", icon: IconFeed, href: '/dashboard/feed', color: "from-emerald-600/40 to-emerald-500/40" },
    { title: "LABOR", subtitle: "STAFF", icon: IconLabor, href: '/dashboard/labor', color: "from-slate-900/40 to-slate-800/40" },
    { title: "EXPENSES", subtitle: "OVERHEAD", icon: IconExpenses, href: '/dashboard/expenses', color: "from-slate-800/40 to-slate-700/40" },
  ];

  const WebDashboard = (
    <div className="animate-in fade-in duration-1000 max-w-7xl mx-auto pb-20">
      <div className="flex items-center gap-10 mb-20">
        <HubSparkle className="h-24 w-24 shrink-0" />
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            MPR <span className="text-primary">SHEEP FARMS</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="h-px w-12 bg-accent opacity-50" />
            <p className="text-[11px] font-black text-primary/60 uppercase tracking-[0.5em] leading-none">
              Precision Operational Environment
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {hubItems.map((item, idx) => {
          if (item.adminOnly && !isAdmin) return null;
          return <HubCard key={idx} item={item} />;
        })}
      </div>
      
      <div className="mt-32 border-t border-slate-200 pt-10 opacity-40">
        <div className="flex justify-between items-center px-2">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-900">MPR ENTERPRISE SYSTEM</p>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2">V5.0.0 TACTICAL DEPLOYMENT</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-900 uppercase">Status: Nominal</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Biometric Link Active</p>
            </div>
            <div className="h-12 w-12 flex items-center justify-center relative bg-white rounded-2xl shadow-xl border border-slate-100">
               <div className="absolute inset-0 bg-primary/5 rounded-2xl animate-pulse" />
               <ShieldCheck className="h-6 w-6 text-primary relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // GATEKEEPER REDIRECT: Dispatch the correct model based on viewport
  return isMobile ? MobileHome : WebDashboard;
}
