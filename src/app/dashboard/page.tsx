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
  BarChart,
  Globe,
  Skull
} from 'lucide-react';

const SheepRamIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,2C10.89,2 10,2.9 10,4C10,4.38 10.3,4.7 10.66,4.93C10.24,5.23 9.89,5.6 9.62,6.04C8.83,5.38 7.82,5 6.75,5C4.68,5 3,6.68 3,8.75C3,9.82 3.38,10.83 4.04,11.62C3.6,11.89 3.23,12.24 2.93,12.66C2.7,12.3 2.38,12 2,12C0.9,12 0,12.89 0,14C0,15.11 0.9,16 2,16C2.38,16 2.7,15.7 2.93,15.34C3.23,15.76 3.6,16.11 4.04,16.38C3.38,17.17 3,18.18 3,19.25C3,21.32 4.68,23 6.75,23C7.82,23 8.83,22.62 9.62,21.96C9.89,22.4 10.24,22.77 10.66,23.07C10.3,23.3 10,23.62 10,24C10,25.11 10.89,26 12,26C13.11,26 14,25.11 14,24C14,23.62 13.7,23.3 13.34,23.07C13.76,22.77 14.11,22.4 14.38,21.96C15.17,22.62 16.18,23 17.25,23C19.32,23 21,21.32 21,19.25C21,18.18 20.62,17.17 19.96,16.38C20.4,16.11 20.77,15.76 21.07,15.34C21.3,15.7 21.62,16 22,16C23.11,16 24,15.11 24,14C24,12.89 23.11,12 22,12C21.62,12 21.3,12.3 21.07,12.66C20.77,12.24 20.4,11.89 19.96,11.62C20.62,10.83 21,9.82 21,8.75C21,6.68 19.32,5 17.25,5C16.18,5 15.17,5.38 14.38,6.04C14.11,5.6 13.76,5.23 13.34,4.93C13.7,4.7 14,4.38 14,4C14,2.9 13.11,2 12,2M12,7C13.66,7 15,8.34 15,10C15,11.66 13.66,13 12,13C10.34,13 9,11.66 9,10C9,8.34 10.34,7 12,7M6.75,7C7.72,7 8.5,7.78 8.5,8.75C8.5,9.72 7.72,10.5 6.75,10.5C5.78,10.5 5,9.72 5,8.75C5,7.78 5.78,7 6.75,7M17.25,7C18.22,7 19,7.78 19,8.75C19,9.72 18.22,10.5 17.25,10.5C16.28,10.5 15.5,9.72 15.5,8.75C15.5,7.78 16.28,7 17.25,7M12,15C13.66,15 15,16.34 15,18C15,19.66 13.66,21 12,21C10.34,21 9,19.66 9,18C9,16.34 10.34,15 12,15M6.75,17.5C7.72,17.5 8.5,18.28 8.5,19.25C8.5,20.22 7.72,21 6.75,21C5.78,21 5,20.22 5,19.25C5,18.28 5.78,17.5 6.75,17.5M17.25,17.5C18.22,17.5 19,18.28 19,19.25C19,20.22 18.22,21 17.25,21C16.28,21 15.5,20.22 15.5,19.25C15.5,18.28 16.28,17.5 17.25,17.5Z" />
    <path d="M19,10C19,10 19,9 18,8C17,7 16,7 16,7C16,7 15.5,5.5 14,4.5C12.5,3.5 10.5,3.5 9,4.5C7.5,5.5 7,7 7,7C7,7 6,7 5,8C4,9 4,10 4,10C4,10 2,10.5 2,13C2,15.5 4,16 4,16V19H6V16H18V19H20V16C20,16 22,15.5 22,13C22,10.5 20,10 19,10M9,11C8.45,11 8,10.55 8,10C8,9.45 8.45,9 9,9C9.55,9 10,9.45 10,10C10,10.55 9.55,11 9,11M15,11C14.45,11 14,10.55 14,10C14,9.45 14.45,9 15,9C15.55,9 16,9.45 16,10C16,10.55 15.55,11 15,11Z" />
  </svg>
);

export default function DashboardPage() {
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const cards = [
    { title: "FLOCK", subtitle: "PUBLIC PROJECT ASSETS", icon: SheepRamIcon, href: '/dashboard/livestock' },
    { title: "TRADE", subtitle: "PUBLIC PROJECT ASSETS", icon: ArrowRightLeft, href: '/dashboard/sales' },
    { title: "HEALTH", subtitle: "OPERATIONS & STAFF", icon: Syringe, href: '/dashboard/medicine' },
    { title: "FEED", subtitle: "OPERATIONS & STAFF", icon: Wheat, href: '/dashboard/feed' },
    { title: "LABOR", subtitle: "OPERATIONS & STAFF", icon: Users, href: '/dashboard/labor' },
    { title: "LOSS", subtitle: "PUBLIC PROJECT ASSETS", icon: Skull, href: '/dashboard/mortality' },
    { title: "LEDGER", subtitle: "PRIVATE PROJECT ASSETS", icon: Wallet, href: '/dashboard/monthly-ledger', adminOnly: true },
    { title: "LIABILITIES", subtitle: "PRIVATE PROJECT ASSETS", icon: BookOpen, href: '/dashboard/balance-sheet', adminOnly: true },
    { title: "MARKET", subtitle: "ECOSYSTEM", icon: Globe, href: '/dashboard/marketplace' },
    { title: "INTEL", subtitle: "AI REPORTS", icon: BarChart, href: '/dashboard/analysis' },
  ];

  const CommandCard = ({ item }: { item: any }) => {
    if (item.adminOnly && !isAdmin) return null;
    const Icon = item.icon;

    return (
      <div className="flex flex-col items-center">
        <Link href={item.href} className="module-card group shadow-sm hover:shadow-2xl">
          <div className="card-icon-box">
            <Icon />
          </div>
          <h3 className="card-title text-center">
            {item.title}
          </h3>
        </Link>
        <p className="card-subtitle">
          {item.subtitle}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12">
      <div className="w-full max-w-[1200px]">
        {/* Hub Header */}
        <div className="flex items-center gap-6 mb-16 ml-4">
          <DashboardSparkleIcon className="h-16 w-16" />
          <div className="space-y-1">
            <h1 className="page-title leading-tight">
              SYSTEM HUB
            </h1>
            <p className="subtitle">
              SYNCHRONIZED OPERATIONAL ENVIRONMENT
            </p>
          </div>
        </div>

        {/* Main Dashboard Panel */}
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-20">
          {cards.map((item, idx) => (
            <CommandCard key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
