'use client';

import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { 
  LayoutGrid, 
  Wallet, 
  Database, 
  Dna, 
  Leaf, 
  Users, 
  ArrowRightLeft,
  BarChart,
  Globe,
  Skull,
  Layers
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';

export default function DashboardPage() {
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const cards = [
    { title: "OVERVIEW", subtitle: "FLOCK INTELLIGENCE", icon: LayoutGrid, href: '/dashboard/overview' },
    { title: "FLOCK", subtitle: "PUBLIC PROJECT ASSETS", icon: SheepIcon, href: '/dashboard/livestock' },
    { title: "TRADE", subtitle: "PUBLIC PROJECT ASSETS", icon: ArrowRightLeft, href: '/dashboard/sales' },
    { title: "HEALTH", subtitle: "OPERATIONS & STAFF", icon: Dna, href: '/dashboard/medicine' },
    { title: "FEED", subtitle: "OPERATIONS & STAFF", icon: Leaf, href: '/dashboard/feed' },
    { title: "LABOR", subtitle: "OPERATIONS & STAFF", icon: Users, href: '/dashboard/labor' },
    { title: "LOSS", subtitle: "PUBLIC PROJECT ASSETS", icon: Skull, href: '/dashboard/mortality' },
    { title: "LEDGER", subtitle: "PRIVATE PROJECT ASSETS", icon: Database, href: '/dashboard/monthly-ledger', adminOnly: true },
    { title: "LIABILITIES", subtitle: "PRIVATE PROJECT ASSETS", icon: Layers, href: '/dashboard/balance-sheet', adminOnly: true },
    { title: "MARKET", subtitle: "ECOSYSTEM", icon: Globe, href: '/dashboard/marketplace' },
    { title: "INTEL", subtitle: "AI REPORTS", icon: BarChart, href: '/dashboard/analysis' },
  ];

  const CommandCard = ({ item }: { item: any }) => {
    if (item.adminOnly && !isAdmin) return null;
    const Icon = item.icon;

    return (
      <Link href={item.href} className="module-card group flex flex-col items-center justify-center gap-3">
        <div className="card-icon">
          <Icon className="w-16 h-16 object-contain text-white" />
        </div>
        <h3 className="card-title">
          {item.title}
        </h3>
        <p className="card-subtitle">
          {item.subtitle}
        </p>
      </Link>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4">
      <div className="w-full max-w-[1200px]">
        {/* Main Dashboard Grid */}
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-12">
          {cards.map((item, idx) => (
            <CommandCard key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
