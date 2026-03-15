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
          color: "#3B82F6", 
          href: '/dashboard/overview'
        },
        { 
          title: "MONTHLY LEDGER", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLedger, 
          color: "#3B82F6", 
          href: '/dashboard/monthly-ledger',
          adminOnly: true
        },
        { 
          title: "LIABILITIES", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLiabilities, 
          color: "#3B82F6", 
          href: '/dashboard/balance-sheet',
          adminOnly: true
        },
        { 
          title: "FLOCK", 
          subtitle: "LIVESTOCK ASSETS", 
          icon: IconFlock, 
          color: "#3B82F6", 
          href: '/dashboard/livestock'
        },
        { 
          title: "TRADE LEDGER", 
          subtitle: "BUY & DISPOSAL", 
          icon: IconTrade, 
          color: "#3B82F6", 
          href: '/dashboard/sales'
        },
        { 
          title: "MEDICINES", 
          subtitle: "HEALTH & CLINICAL", 
          icon: IconHealth, 
          color: "#3B82F6", 
          href: '/dashboard/medicine'
        },
        { 
          title: "FEED", 
          subtitle: "GRAIN INVENTORY", 
          icon: IconFeed, 
          color: "#3B82F6", 
          href: '/dashboard/feed'
        },
        { 
          title: "LABOR", 
          subtitle: "STAFF OPERATIONS", 
          icon: IconLabor, 
          color: "#3B82F6", 
          href: '/dashboard/labor'
        },
        { 
          title: "EXPENSES", 
          subtitle: "OVERHEAD AUDIT", 
          icon: IconExpenses, 
          color: "#3B82F6", 
          href: '/dashboard/expenses'
        },
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-blue-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">SYNCING COMMAND HUB...</p>
        </div>
      </div>
    );
  }

  const HubCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    return (
      <Link href={item.href} className="group transition-all active:scale-95">
        <div className="hub-card w-full h-[220px] bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 border border-slate-100 hover:border-blue-500/40 hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="p-4 rounded-3xl flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${item.color}10` }}>
            <Icon className="h-16 w-16" style={{ color: item.color }} />
          </div>
          <div className="text-center relative z-10">
            <h3 className="text-[13px] font-black text-slate-900 tracking-wider leading-none mb-1 uppercase">{item.title}</h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.subtitle}</p>
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            SYSTEM COMMAND HUB
          </h1>
          <p className="text-[11px] font-black text-blue-600/60 uppercase tracking-[0.4em]">
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
      
      <div className="mt-20 border-t border-slate-100 pt-8 opacity-40">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">SYNC PRO ELITE</p>
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Tactical v4.2.0</p>
      </div>
    </div>
  );
}