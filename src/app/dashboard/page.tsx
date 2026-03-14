'use client';

import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
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
  Circle
} from 'lucide-react';

const SheepIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19,10C19,10 19,9 18,8C17,7 16,7 16,7C16,7 15.5,5.5 14,4.5C12.5,3.5 10.5,3.5 9,4.5C7.5,5.5 7,7 7,7C7,7 6,7 5,8C4,9 4,10 4,10C4,10 2,10.5 2,13C2,15.5 4,16 4,16V19H6V16H18V19H20V16C20,16 22,15.5 22,13C22,10.5 20,10 19,10M9,11C8.45,11 8,10.55 8,10C8,9.45 8.45,9 9,9C9.55,9 10,9.45 10,10C10,10.55 9.55,11 9,11M15,11C14.45,11 14,10.55 14,10C14,9.45 14.45,9 15,9C15.55,9 16,9.45 16,10C16,10.55 15.55,11 15,11Z" />
  </svg>
);

const DatabaseLockIcon = ({ className }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <Wallet className="h-full w-full" />
    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
      <div className="bg-[#16a34a] h-3 w-3 rounded-full flex items-center justify-center">
        <div className="h-1 w-1 bg-white rounded-full" />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const cards = [
    { title: "OVERVIEW", subtitle: "ANALYTICS", icon: LayoutGrid, href: '/dashboard/overview' },
    { title: "MONTHLY LEDGER", subtitle: "PRIVATE ASSETS", icon: DatabaseLockIcon, href: '/dashboard/monthly-ledger', adminOnly: true },
    { title: "LIABILITIES", subtitle: "PRIVATE ASSETS", icon: BookOpen, href: '/dashboard/balance-sheet', adminOnly: true },
    { title: "FLOCK", subtitle: "PUBLIC ASSETS", icon: SheepIcon, href: '/dashboard/livestock' },
    { title: "HEALTH", subtitle: "OPERATIONS", icon: Syringe, href: '/dashboard/medicine' },
    { title: "FEED", subtitle: "OPERATIONS", icon: Wheat, href: '/dashboard/feed' },
    { title: "LABOR", subtitle: "OPERATIONS", icon: Users, href: '/dashboard/labor' },
    { title: "EXPENSES", subtitle: "PUBLIC ASSETS", icon: Receipt, href: '/dashboard/expenses' },
    { title: "TRADE", subtitle: "PUBLIC ASSETS", icon: ArrowRightLeft, href: '/dashboard/sales' },
  ];

  const CommandCard = ({ item }: { item: any }) => {
    if (item.adminOnly && !isAdmin) return null;
    const Icon = item.icon;

    return (
      <Link href={item.href} className="group">
        <div className="glass-card relative aspect-square rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-6 p-4 bg-[#dcfce7] rounded-2xl transition-transform duration-500 group-hover:scale-110">
            <Icon className="h-12 w-12 text-[#16a34a]" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-[14px] font-black tracking-tight text-neutral-900 uppercase">
              {item.title}
            </h3>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
              {item.subtitle}
            </p>
          </div>

          <div className="absolute bottom-6 left-8 flex gap-0.5 opacity-20">
            <Circle className="h-1 w-1 fill-current" />
            <Circle className="h-1 w-1 fill-current" />
            <Circle className="h-1 w-1 fill-current" />
          </div>
          <div className="absolute bottom-6 right-8 flex gap-0.5 opacity-20">
            <Circle className="h-1 w-1 fill-current" />
            <Circle className="h-1 w-1 fill-current" />
            <Circle className="h-1 w-1 fill-current" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-4">
      <div className="w-full max-w-6xl">
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

        <div className="dashboard-panel">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {cards.map((item, idx) => (
              <CommandCard key={idx} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}