'use client';

import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { DashboardSparkleIcon } from '@/components/logo';
import { 
  LayoutGrid, 
  Wallet, 
  BookOpen, 
  Syringe, 
  Wheat, 
  Users, 
  Receipt,
  ArrowRightLeft,
  Circle,
  BarChart,
  Globe
} from 'lucide-react';

const SheepIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M19,10C19,10 19,9 18,8C17,7 16,7 16,7C16,7 15.5,5.5 14,4.5C12.5,3.5 10.5,3.5 9,4.5C7.5,5.5 7,7 7,7C7,7 6,7 5,8C4,9 4,10 4,10C4,10 2,10.5 2,13C2,15.5 4,16 4,16V19H6V16H18V19H20V16C20,16 22,15.5 22,13C22,10.5 20,10 19,10M9,11C8.45,11 8,10.55 8,10C8,9.45 8.45,9 9,9C9.55,9 10,9.45 10,10C10,10.55 9.55,11 9,11M15,11C14.45,11 14,10.55 14,10C14,9.45 14.45,9 15,9C15.55,9 16,9.45 16,10C16,10.55 15.55,11 15,11Z" />
  </svg>
);

export default function DashboardPage() {
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const cards = [
    { title: "OVERVIEW", subtitle: "ANALYTICS", icon: LayoutGrid, href: '/dashboard/overview' },
    { title: "INTELLIGENCE", subtitle: "AI REPORTS", icon: BarChart, href: '/dashboard/analysis' },
    { title: "LEDGER", subtitle: "PRIVATE ASSETS", icon: Wallet, href: '/dashboard/monthly-ledger', adminOnly: true },
    { title: "LIABILITIES", subtitle: "PRIVATE ASSETS", icon: BookOpen, href: '/dashboard/balance-sheet', adminOnly: true },
    { title: "FLOCK", subtitle: "PUBLIC ASSETS", icon: SheepIcon, href: '/dashboard/livestock' },
    { title: "TRADE", subtitle: "PUBLIC ASSETS", icon: ArrowRightLeft, href: '/dashboard/sales' },
    { title: "HEALTH", subtitle: "OPERATIONS", icon: Syringe, href: '/dashboard/medicine' },
    { title: "FEED", subtitle: "OPERATIONS", icon: Wheat, href: '/dashboard/feed' },
    { title: "LABOR", subtitle: "OPERATIONS", icon: Users, href: '/dashboard/labor' },
    { title: "EXPENSES", subtitle: "PUBLIC ASSETS", icon: Receipt, href: '/dashboard/expenses' },
    { title: "MARKET", subtitle: "COMMUNITY", icon: Globe, href: '/dashboard/marketplace' },
  ];

  const CommandCard = ({ item }: { item: any }) => {
    if (item.adminOnly && !isAdmin) return null;
    const Icon = item.icon;

    return (
      <Link href={item.href} className="module-card group">
        {/* Layout Part 1: Icon */}
        <div className="card-icon">
          <Icon />
        </div>
        
        {/* Layout Part 2: Title */}
        <h3 className="card-title">
          {item.title}
        </h3>

        {/* Layout Part 3: Subtitle */}
        <p className="card-subtitle">
          {item.subtitle}
        </p>

        {/* Triple Dot Decorations */}
        <div className="absolute bottom-4 left-6 flex gap-0.5 opacity-20 text-[#14532d]">
          <Circle className="h-1 w-1 fill-current" />
          <Circle className="h-1 w-1 fill-current" />
          <Circle className="h-1 w-1 fill-current" />
        </div>
        <div className="absolute bottom-4 right-6 flex gap-0.5 opacity-20 text-[#14532d]">
          <Circle className="h-1 w-1 fill-current" />
          <Circle className="h-1 w-1 fill-current" />
          <Circle className="h-1 w-1 fill-current" />
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-4">
      <div className="w-full max-w-7xl">
        {/* Hub Header */}
        <div className="flex items-center gap-6 mb-12 ml-4">
          <DashboardSparkleIcon className="h-16 w-16" />
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-[#14532d] uppercase">
              SYSTEM COMMAND HUB
            </h1>
            <p className="text-[11px] font-bold text-[#4caf50] uppercase tracking-[0.3em]">
              SYNCHRONIZED OPERATIONAL ENVIRONMENT
            </p>
          </div>
        </div>

        {/* Main Dashboard Panel */}
        <div className="dashboard-panel">
          <div className="flex flex-wrap justify-center gap-8">
            {cards.map((item, idx) => (
              <CommandCard key={idx} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}