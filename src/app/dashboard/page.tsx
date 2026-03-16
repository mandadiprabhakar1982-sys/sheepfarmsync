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
          color: "from-blue-500/20 to-indigo-500/20"
        },
        { 
          title: "LEDGER", 
          subtitle: "BALANCE SHEET", 
          icon: IconLedger, 
          href: '/dashboard/monthly-ledger',
          adminOnly: true,
          color: "from-emerald-500/20 to-teal-500/20"
        },
        { 
          title: "DEBT", 
          subtitle: "PORTFOLIO", 
          icon: IconLiabilities, 
          href: '/dashboard/balance-sheet',
          adminOnly: true,
          color: "from-rose-500/20 to-orange-500/20"
        },
        { 
          title: "FLOCK", 
          subtitle: "LIVESTOCK", 
          icon: IconFlock, 
          href: '/dashboard/livestock',
          color: "from-amber-500/20 to-yellow-500/20"
        },
        { 
          title: "TRADE", 
          subtitle: "BUY & SELL", 
          icon: IconTrade, 
          href: '/dashboard/sales',
          color: "from-sky-500/20 to-blue-500/20"
        },
        { 
          title: "HEALTH", 
          subtitle: "CLINICAL", 
          icon: IconHealth, 
          href: '/dashboard/medicine',
          color: "from-red-500/20 to-rose-500/20"
        },
        { 
          title: "FEED", 
          subtitle: "INVENTORY", 
          icon: IconFeed, 
          href: '/dashboard/feed',
          color: "from-lime-500/20 to-green-500/20"
        },
        { 
          title: "LABOR", 
          subtitle: "STAFF", 
          icon: IconLabor, 
          href: '/dashboard/labor',
          color: "from-orange-500/20 to-amber-500/20"
        },
        { 
          title: "EXPENSES", 
          subtitle: "OVERHEAD", 
          icon: IconExpenses, 
          href: '/dashboard/expenses',
          color: "from-slate-500/20 to-gray-500/20"
        },
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-primary animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">SYNCING COMMAND HUB...</p>
        </div>
      </div>
    );
  }

  const HubCard = ({ item }: { item: any }) => {
    return (
      <Link href={item.href} className="group transition-all active:scale-95">
        <div className="w-full h-[180px] sm:h-[240px] md:h-[280px] bg-white/70 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1.5 border border-white/60 relative overflow-hidden glass-sheen">
          
          {/* Vibrant Glow Background */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", item.color)} />
          
          {/* Icon Container */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-transform group-hover:scale-110 duration-500 z-10 text-slate-900 group-hover:text-white flex items-center justify-center">
            <item.icon className="w-full h-full" />
          </div>
          
          <div className="text-center relative z-10">
            <h3 className="text-[11px] sm:text-[13px] md:text-[15px] font-black text-slate-900 tracking-wider leading-none mb-1 uppercase group-hover:text-white transition-colors">{item.title}</h3>
            <p className="hidden sm:block text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] group-hover:text-white/60 transition-colors">{item.subtitle}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="animate-in fade-in duration-1000 max-w-7xl mx-auto py-4 sm:py-8 px-4">
      <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-16">
        <HubSparkle className="h-12 w-12 sm:h-16 sm:w-16" />
        <div className="space-y-1 sm:space-y-1.5">
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
            MPR SHEEP FARMS
          </h1>
          <p className="text-[8px] sm:text-[10px] font-black text-primary/60 uppercase tracking-[0.3em] sm:tracking-[0.4em]">
            SYNCHRONIZED OPERATIONAL ENVIRONMENT
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
        {groups[0].items.map((item, idx) => {
          if (item.adminOnly && !isAdmin) return null;
          return <HubCard key={idx} item={item} />;
        })}
      </div>
      
      <div className="mt-16 sm:mt-24 border-t border-slate-200/60 pt-8 sm:pt-10 opacity-30">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">SYNC PRO ENTERPRISE</p>
            <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Tactical v4.5.0 Deployment</p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center relative">
             <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
             <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
