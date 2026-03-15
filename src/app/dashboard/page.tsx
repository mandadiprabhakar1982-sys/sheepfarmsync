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
          subtitle: "ANALYTICS ENGINE", 
          icon: IconOverview, 
          color: "#4ADE80", 
          href: '/dashboard/overview'
        },
        { 
          title: "MONTHLY LEDGER", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLedger, 
          color: "#F87171", 
          href: '/dashboard/monthly-ledger',
          adminOnly: true
        },
        { 
          title: "LIABILITIES", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLiabilities, 
          color: "#60A5FA", 
          href: '/dashboard/balance-sheet',
          adminOnly: true
        },
        { 
          title: "FLOCK", 
          subtitle: "LIVESTOCK ASSETS", 
          icon: IconFlock, 
          color: "#FB923C", 
          href: '/dashboard/livestock'
        },
        { 
          title: "TRADE LEDGER", 
          subtitle: "BUY & DISPOSAL", 
          icon: IconTrade, 
          color: "#2DD4BF", 
          href: '/dashboard/sales'
        },
        { 
          title: "MEDICINES", 
          subtitle: "HEALTH & CLINICAL", 
          icon: IconHealth, 
          color: "#A78BFA", 
          href: '/dashboard/medicine'
        },
        { 
          title: "FEED", 
          subtitle: "GRAIN INVENTORY", 
          icon: IconFeed, 
          color: "#FACC15", 
          href: '/dashboard/feed'
        },
        { 
          title: "LABOR", 
          subtitle: "STAFF OPERATIONS", 
          icon: IconLabor, 
          color: "#38BDF8", 
          href: '/dashboard/labor'
        },
        { 
          title: "EXPENSES", 
          subtitle: "OVERHEAD AUDIT", 
          icon: IconExpenses, 
          color: "#94A3B8", 
          href: '/dashboard/expenses'
        },
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white/5 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-emerald-500/40 uppercase tracking-[0.4em]">SYNCING COMMAND HUB...</p>
        </div>
      </div>
    );
  }

  const HubCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    return (
      <Link href={item.href} className="group transition-all active:scale-95">
        <div className="hub-card w-full h-[220px] bg-white/[0.03] rounded-[2rem] p-8 flex flex-col items-center justify-center gap-6 border border-white/5 hover:border-emerald-500/40 hover:-translate-y-1 transition-all shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="p-4 rounded-2xl flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${item.color}10` }}>
            <Icon className="h-16 w-16" style={{ color: item.color }} />
          </div>
          <div className="text-center relative z-10">
            <h3 className="text-[13px] font-black text-white tracking-wider leading-none mb-1 uppercase">{item.title}</h3>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{item.subtitle}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="animate-in fade-in duration-1000 max-w-7xl mx-auto py-8">
      <div className="flex items-center gap-8 mb-12">
        <HubSparkle />
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            SYSTEM COMMAND HUB
          </h1>
          <p className="text-[11px] font-black text-emerald-500/40 uppercase tracking-[0.4em]">
            SYNCHRONIZED OPERATIONAL ENVIRONMENT
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {groups[0].items.map((item, idx) => {
          if (item.adminOnly && !isAdmin) return null;
          return <HubCard key={idx} item={item} />;
        })}
      </div>
      
      <div className="mt-20 border-t border-white/5 pt-8 opacity-20">
        <p className="text-[9px] font-black uppercase tracking-widest text-white">SYNC PRO ELITE</p>
        <p className="text-[8px] font-bold text-white uppercase tracking-tighter">Tactical v4.2.0</p>
      </div>
    </div>
  );
}