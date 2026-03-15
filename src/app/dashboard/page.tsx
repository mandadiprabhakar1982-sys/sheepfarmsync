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
    totalSheep, 
    purchases,
    sales,
    healthTasks,
    feedCosts,
    laborCosts,
    farmExpenses,
    bankLoans,
    creditCards,
    privateDebts,
    monthlyIncomes,
    monthlyExpenses,
    isLoading
  } = useFarm();
  
  const isAdmin = userRole === 'admin';

  const tradeCount = (purchases?.length || 0) + (sales?.length || 0);
  const healthCount = healthTasks?.length || 0;
  const feedCount = feedCosts?.length || 0;
  const laborCount = laborCosts?.length || 0;
  const expenseCount = farmExpenses?.length || 0;
  const ledgerCount = (monthlyIncomes?.length || 0) + (monthlyExpenses?.length || 0);
  const liabCount = (bankLoans?.length || 0) + (creditCards?.length || 0) + (privateDebts?.length || 0);

  const groups = [
    {
      items: [
        { 
          title: "OVERVIEW", 
          subtitle: "ANALYTICS ENGINE", 
          icon: IconOverview, 
          color: "#4ADE80", 
          href: '/dashboard/overview',
          value: "ACTIVE"
        },
        { 
          title: "MONTHLY LEDGER", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLedger, 
          color: "#F87171", 
          href: '/dashboard/monthly-ledger',
          adminOnly: true,
          value: ledgerCount.toString()
        },
        { 
          title: "LIABILITIES", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLiabilities, 
          color: "#3B82F6", 
          href: '/dashboard/balance-sheet',
          adminOnly: true,
          value: liabCount.toString()
        },
        { 
          title: "FLOCK", 
          subtitle: "LIVESTOCK ASSETS", 
          icon: IconFlock, 
          color: "#FBBF24", 
          href: '/dashboard/livestock',
          value: totalSheep.toString()
        },
        { 
          title: "TRADE LEDGER", 
          subtitle: "BUY & DISPOSAL", 
          icon: IconTrade, 
          color: "#2DD4BF", 
          href: '/dashboard/sales',
          value: tradeCount.toString()
        },
        { 
          title: "MEDICINES", 
          subtitle: "HEALTH & CLINICAL", 
          icon: IconHealth, 
          color: "#A78BFA", 
          href: '/dashboard/medicine',
          value: healthCount.toString()
        },
        { 
          title: "FEED", 
          subtitle: "GRAIN INVENTORY", 
          icon: IconFeed, 
          color: "#F59E0B", 
          href: '/dashboard/feed',
          value: feedCount.toString()
        },
        { 
          title: "LABOR", 
          subtitle: "STAFF OPERATIONS", 
          icon: IconLabor, 
          color: "#60A5FA", 
          href: '/dashboard/labor',
          value: laborCount.toString()
        },
        { 
          title: "EXPENSES", 
          subtitle: "OVERHEAD AUDIT", 
          icon: IconExpenses, 
          color: "#94A3B8", 
          href: '/dashboard/expenses',
          value: expenseCount.toString()
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
      <Link href={item.href} className="group transition-all active:scale-95 w-[240px]">
        <div className="hub-card h-[280px] bg-[#C9D1D6] rounded-[40px] p-8 flex flex-col items-center justify-between border-b-4 border-black/10 hover:border-black/20 hover:-translate-y-1 transition-all shadow-xl">
          <div className="blob-shape p-6 rounded-[2rem] flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
            <Icon className="h-14 w-14" style={{ color: item.color }} />
          </div>
          <div className="text-center">
            <h3 className="text-[14px] font-black text-neutral-900 tracking-tight leading-none mb-1 uppercase">{item.title}</h3>
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{item.subtitle}</p>
          </div>
          <div className="text-3xl font-black text-neutral-900 tracking-tighter tabular-nums">
            {item.value}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="animate-in fade-in duration-1000 max-w-7xl mx-auto">
      <div className="flex items-center gap-8 mb-16">
        <HubSparkle />
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            SYSTEM COMMAND HUB
          </h1>
          <p className="text-[11px] font-black text-[#10B981]/60 uppercase tracking-[0.4em]">
            SYNCHRONIZED OPERATIONAL ENVIRONMENT
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-10 justify-start">
        {groups[0].items.map((item, idx) => {
          if (item.adminOnly && !isAdmin) return null;
          return <HubCard key={idx} item={item} />;
        })}
      </div>
      
      <div className="mt-24 border-t border-white/5 pt-8 opacity-20">
        <p className="text-[9px] font-black uppercase tracking-widest text-white">SYNC PRO ELITE</p>
        <p className="text-[8px] font-bold text-white uppercase tracking-tighter">Tactical v3.5.0</p>
      </div>
    </div>
  );
}
