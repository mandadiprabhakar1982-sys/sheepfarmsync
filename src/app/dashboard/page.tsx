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

  // Dynamic Data Aggregation
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
          color: "#4A8FA1", 
          href: '/dashboard/overview',
          value: "367" // Matching reference image mock value for demo
        },
        { 
          title: "MONTHLY LEDGER", 
          subtitle: "PRIVATE LABELS", 
          icon: IconLedger, 
          color: "#B04A3E", 
          href: '/dashboard/monthly-ledger',
          adminOnly: true,
          value: ledgerCount.toString()
        },
        { 
          title: "LIABILITIES", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLiabilities, 
          color: "#569668", 
          href: '/dashboard/balance-sheet',
          adminOnly: true,
          value: liabCount.toString()
        },
        { 
          title: "FLOCK", 
          subtitle: "PUBLIC PROJECT", 
          icon: IconFlock, 
          color: "#D97D3A", 
          href: '/dashboard/livestock',
          value: totalSheep.toString()
        },
        { 
          title: "PURCHASES & SALES", 
          subtitle: "PUBLIC PROJECT", 
          icon: IconTrade, 
          color: "#5A9A94", 
          href: '/dashboard/sales',
          value: tradeCount.toString()
        },
        { 
          title: "HEALTH", 
          subtitle: "OPERATIONS & STAFF", 
          icon: IconHealth, 
          color: "#6A4A8F", 
          href: '/dashboard/medicine',
          value: healthCount.toString()
        },
        { 
          title: "FEED", 
          subtitle: "GRAIN", 
          icon: IconFeed, 
          color: "#D9A73A", 
          href: '/dashboard/feed',
          value: feedCount.toString()
        },
        { 
          title: "LABOR", 
          subtitle: "OPERATIONS & STAFF", 
          icon: IconLabor, 
          color: "#4A6A7A", 
          href: '/dashboard/labor',
          value: laborCount.toString()
        },
        { 
          title: "EXPENSES", 
          subtitle: "PUBLIC PROJECT", 
          icon: IconExpenses, 
          color: "#9AAAB5", 
          href: '/dashboard/expenses',
          value: expenseCount.toString()
        },
      ]
    }
  ];

  const SquircleCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    return (
      <Link href={item.href} className="group transition-all active:scale-95">
        <div className="hub-card">
          <div className="blob-shape" style={{ backgroundColor: item.color }}>
            <Icon className="h-12 w-12 text-white/90" />
          </div>
          <div className="text-center">
            <h3 className="title-precise">{item.title}</h3>
            <p className="subtitle-precise">{item.subtitle}</p>
          </div>
          <div className="value-precise">{item.value}</div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-full py-16 px-12 animate-in fade-in duration-1000">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Hub Header */}
        <div className="flex items-center gap-8 mb-16">
          <HubSparkle />
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase">
              SYSTEM COMMAND HUB
            </h1>
            <p className="text-[13px] font-bold text-neutral-400 uppercase tracking-[0.3em]">
              SYNCHRONIZED OPERATIONAL ENVIRONMENT
            </p>
          </div>
        </div>

        {/* Tactical Grid */}
        <div className="flex flex-wrap gap-8 justify-start">
          {groups[0].items.map((item, idx) => {
            if (item.adminOnly && !isAdmin) return null;
            return <SquircleCard key={idx} item={item} />;
          })}
        </div>
      </div>
      
      {/* Footer Meta */}
      <div className="mt-24 max-w-[1400px] mx-auto w-full border-t border-black/5 pt-8 opacity-20">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">SYNC PRO</p>
        <p className="text-[8px] font-bold text-slate-900 uppercase tracking-tighter">Prefageur v2.5.0</p>
      </div>
    </div>
  );
}