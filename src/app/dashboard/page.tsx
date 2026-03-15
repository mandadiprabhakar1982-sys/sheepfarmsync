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
    totalSales, 
    totalExpenses, 
    totalLoanBalance, 
    totalMedicineCost,
    totalFeedCost,
    totalLaborCost
  } = useFarm();
  const isAdmin = userRole === 'admin';

  const groups = [
    {
      items: [
        { 
          title: "OVERVIEW", 
          subtitle: "ANALYTICS", 
          icon: IconOverview, 
          color: "#4A8FA1", 
          href: '/dashboard/overview',
          value: "367"
        },
        { 
          title: "MONTHLY LEDGER", 
          subtitle: "PRIVATE LABELS", 
          icon: IconLedger, 
          color: "#B04A3E", 
          href: '/dashboard/monthly-ledger',
          adminOnly: true,
          value: "6"
        },
        { 
          title: "LIABILITIES", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLiabilities, 
          color: "#569668", 
          href: '/dashboard/balance-sheet',
          adminOnly: true,
          value: "11"
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
          value: "11"
        },
        { 
          title: "HEALTH", 
          subtitle: "OPERATIONS & STAFF", 
          icon: IconHealth, 
          color: "#6A4A8F", 
          href: '/dashboard/medicine',
          value: "42"
        },
        { 
          title: "FEED", 
          subtitle: "GRAIN", 
          icon: IconFeed, 
          color: "#D9A73A", 
          href: '/dashboard/feed',
          value: "10"
        },
        { 
          title: "LABOR", 
          subtitle: "OPERATIONS & STAFF", 
          icon: IconLabor, 
          color: "#4A6A7A", 
          href: '/dashboard/labor',
          value: "0"
        },
        { 
          title: "EXPENSES", 
          subtitle: "PUBLIC PROJECT", 
          icon: IconExpenses, 
          color: "#9AAAB5", 
          href: '/dashboard/expenses',
          value: "0"
        },
      ]
    }
  ];

  const SquircleCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    return (
      <Link href={item.href} className="group flex flex-col w-[220px]">
        <div className="hub-card">
          <div className="blob-shape" style={{ backgroundColor: item.color }}>
            <Icon className="h-10 w-10 text-black/80" />
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
            <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight uppercase">
              SYSTEM COMMAND HUB
            </h1>
            <p className="text-[13px] font-bold text-[#1A1A1A]/40 uppercase tracking-[0.3em]">
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
      
      {/* Decorative Sparkle Footer */}
      <div className="fixed bottom-12 right-12 opacity-40">
        <IconOverview className="h-12 w-12 text-white" />
      </div>
    </div>
  );
}