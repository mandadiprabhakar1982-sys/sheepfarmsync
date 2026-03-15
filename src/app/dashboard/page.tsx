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
    monthlyExpenses
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
          subtitle: "ANALYTICS", 
          icon: IconOverview, 
          color: "#4ADE80", 
          href: '/dashboard/overview',
          value: "367"
        },
        { 
          title: "MONTHLY LEDGER", 
          subtitle: "PRIVATE LABELS", 
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
          subtitle: "PUBLIC PROJECT", 
          icon: IconFlock, 
          color: "#FBBF24", 
          href: '/dashboard/livestock',
          value: totalSheep.toString()
        },
        { 
          title: "PURCHASES & SALES", 
          subtitle: "PUBLIC PROJECT", 
          icon: IconTrade, 
          color: "#2DD4BF", 
          href: '/dashboard/sales',
          value: tradeCount.toString()
        },
        { 
          title: "HEALTH", 
          subtitle: "OPERATIONS & STAFF", 
          icon: IconHealth, 
          color: "#A78BFA", 
          href: '/dashboard/medicine',
          value: healthCount.toString()
        },
        { 
          title: "FEED", 
          subtitle: "GRAIN", 
          icon: IconFeed, 
          color: "#F59E0B", 
          href: '/dashboard/feed',
          value: feedCount.toString()
        },
        { 
          title: "LABOR", 
          subtitle: "OPERATIONS & STAFF", 
          icon: IconLabor, 
          color: "#60A5FA", 
          href: '/dashboard/labor',
          value: laborCount.toString()
        },
        { 
          title: "EXPENSES", 
          subtitle: "PUBLIC PROJECT", 
          icon: IconExpenses, 
          color: "#94A3B8", 
          href: '/dashboard/expenses',
          value: expenseCount.toString()
        },
      ]
    }
  ];

  const HubCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    return (
      <Link href={item.href} className="group transition-all active:scale-95">
        <div className="hub-card">
          <div className="blob-shape" style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}>
            <Icon className="h-12 w-12" style={{ color: item.color }} />
          </div>
          <div className="text-center mt-4">
            <h3 className="title-precise">{item.title}</h3>
            <p className="subtitle-precise">{item.subtitle}</p>
          </div>
          <div className="value-precise mt-auto">{item.value}</div>
        </div>
      </Link>
    );
  };

  return (
    <div className="animate-in fade-in duration-1000">
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

      <div className="flex flex-wrap gap-8 justify-start">
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