'use client';

import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
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
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { 
    userRole, 
    isLoading
  } = useFarm();
  
  const isAdmin = userRole === 'admin';

  const groups = [
    {
      items: [
        { 
          title: "OVERVIEW", 
          subtitle: "ANALYTICS", 
          icon: IconOverview, 
          href: '/dashboard/overview',
          color: "from-emerald-950/40 to-emerald-900/40"
        },
        { 
          title: "LEDGER", 
          subtitle: "BALANCE SHEET", 
          icon: IconLedger, 
          href: '/dashboard/monthly-ledger',
          adminOnly: true,
          color: "from-emerald-900/40 to-emerald-800/40"
        },
        { 
          title: "DEBT", 
          subtitle: "PORTFOLIO", 
          icon: IconLiabilities, 
          href: '/dashboard/balance-sheet',
          adminOnly: true,
          color: "from-amber-900/40 to-amber-800/40"
        },
        { 
          title: "FLOCK", 
          subtitle: "LIVESTOCK", 
          icon: IconFlock, 
          href: '/dashboard/livestock',
          color: "from-emerald-800/40 to-emerald-700/40"
        },
        { 
          title: "TRADE", 
          subtitle: "BUY & SELL", 
          icon: IconTrade, 
          href: '/dashboard/sales',
          color: "from-emerald-700/40 to-emerald-600/40"
        },
        { 
          title: "HEALTH", 
          subtitle: "CLINICAL", 
          icon: IconHealth, 
          href: '/dashboard/medicine',
          color: "from-red-900/40 to-red-800/40"
        },
        { 
          title: "FEED", 
          subtitle: "INVENTORY", 
          icon: IconFeed, 
          href: '/dashboard/feed',
          color: "from-emerald-600/40 to-emerald-500/40"
        },
        { 
          title: "LABOR", 
          subtitle: "STAFF", 
          icon: IconLabor, 
          href: '/dashboard/labor',
          color: "from-slate-900/40 to-slate-800/40"
        },
        { 
          title: "EXPENSES", 
          subtitle: "OVERHEAD", 
          icon: IconExpenses, 
          href: '/dashboard/expenses',
          color: "from-slate-800/40 to-slate-700/40"
        },
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-primary animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">SYNCING COMMAND HUB...</p>
        </div>
      </div>
    );
  }

  const HubCard = ({ item }: { item: any }) => {
    return (
      <Link href={item.href} className="group transition-all active:scale-95 block">
        <div className="w-full h-[140px] sm:h-[240px] bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 sm:p-8 flex flex-col items-center justify-center gap-2 sm:gap-6 shadow-xl hover:shadow-[0_20px_60px_rgba(6,78,59,0.15)] transition-all hover:-translate-y-1 border border-white relative overflow-hidden glass-sheen">
          
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", item.color)} />
          
          <div className="relative w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-transform group-hover:scale-110 duration-700 z-10 text-primary group-hover:text-white flex items-center justify-center">
            <item.icon className="w-full h-full" />
          </div>
          
          <div className="text-center relative z-10">
            <h3 className="text-[10px] sm:text-[13px] md:text-[15px] font-black text-slate-900 tracking-widest leading-none mb-1 uppercase group-hover:text-white transition-colors">{item.title}</h3>
            <p className="hidden sm:block text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] group-hover:text-accent transition-colors">{item.subtitle}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="animate-in fade-in duration-1000 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 sm:gap-10 mb-8 sm:mb-20">
        <HubSparkle className="h-10 w-10 sm:h-24 sm:w-24 shrink-0" />
        <div className="space-y-1 sm:space-y-3">
          <h1 className="text-lg sm:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            MPR <span className="text-primary">SHEEP FARMS</span>
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="h-px w-6 sm:w-12 bg-accent opacity-50 hidden sm:block" />
            <p className="text-[7px] sm:text-[11px] font-black text-primary/60 uppercase tracking-[0.2em] sm:tracking-[0.5em] leading-none">
              Precision Operational Environment
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-10">
        {groups[0].items.map((item, idx) => {
          if (item.adminOnly && !isAdmin) return null;
          return <HubCard key={idx} item={item} />;
        })}
      </div>
      
      <div className="mt-12 sm:mt-32 border-t border-slate-200 pt-8 sm:pt-10 opacity-40">
        <div className="flex justify-between items-center px-2">
          <div>
            <p className="text-[8px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-900">MPR ENTERPRISE SYSTEM</p>
            <p className="text-[6px] sm:text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1 sm:mt-2">V5.0.0 TACTICAL DEPLOYMENT</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-900 uppercase">Status: Nominal</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Biometric Link Active</p>
            </div>
            <div className="h-8 w-8 sm:h-12 sm:w-12 flex items-center justify-center relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100">
               <div className="absolute inset-0 bg-primary/5 rounded-xl sm:rounded-2xl animate-pulse" />
               <ShieldCheck className="h-4 w-4 sm:h-6 sm:w-6 text-primary relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}