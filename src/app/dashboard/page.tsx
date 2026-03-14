'use client';

import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { 
  HighFidelityOverview,
  HighFidelityLedger,
  HighFidelityLiabilities,
  SheepIcon,
  HighFidelityHealth,
  HighFidelityFeed,
  HighFidelityLabor,
  HighFidelityExpenses,
  DashboardSparkleIcon 
} from '@/components/logo';

export default function DashboardPage() {
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const cards = [
    { 
      title: "OVERVIEW", 
      subtitle: "... ANALYTICS ...", 
      icon: HighFidelityOverview, 
      href: '/dashboard/overview' 
    },
    { 
      title: "LEDGER", 
      subtitle: "PRIVATE PROJECT ASSETS", 
      icon: HighFidelityLedger, 
      href: '/dashboard/monthly-ledger', 
      adminOnly: true 
    },
    { 
      title: "DEBT", 
      subtitle: "PRIVATE PROJECT ASSETS", 
      icon: HighFidelityLiabilities, 
      href: '/dashboard/balance-sheet', 
      adminOnly: true 
    },
    { 
      title: "FLOCK", 
      subtitle: "PUBLIC PROJECT ASSETS", 
      icon: SheepIcon, 
      href: '/dashboard/livestock' 
    },
    { 
      title: "HEALTH", 
      subtitle: "... OPERATIONS & STAFF ...", 
      icon: HighFidelityHealth, 
      href: '/dashboard/medicine' 
    },
    { 
      title: "FEED", 
      subtitle: "... OPERATIONS & STAFF ...", 
      icon: HighFidelityFeed, 
      href: '/dashboard/feed' 
    },
    { 
      title: "LABOR", 
      subtitle: "... OPERATIONS & STAFF ...", 
      icon: HighFidelityLabor, 
      href: '/dashboard/labor' 
    },
    { 
      title: "EXPENSES", 
      subtitle: "PUBLIC PROJECT ASSETS", 
      icon: HighFidelityExpenses, 
      href: '/dashboard/expenses' 
    },
  ];

  const CommandCard = ({ item }: { item: any }) => {
    if (item.adminOnly && !isAdmin) return null;
    const Icon = item.icon;

    return (
      <div className="flex flex-col items-center gap-6 group">
        <Link href={item.href} className="module-card">
          <div className="flex flex-col items-center gap-4">
            <Icon className="w-24 h-24 text-[#14532d] transition-transform group-hover:scale-110 duration-500" />
            <h3 className="card-title">{item.title}</h3>
          </div>
        </Link>
        <p className="card-subtitle opacity-40">{item.subtitle}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 animate-in fade-in duration-700">
      <div className="w-full max-w-[1200px] space-y-16">
        {/* Header Hero Section */}
        <div className="flex items-center gap-6 mb-16 pl-4">
          <DashboardSparkleIcon className="h-16 w-16" />
          <div>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900 leading-none uppercase">System Command Hub</h1>
            <p className="text-[12px] font-bold text-neutral-400 uppercase tracking-[0.3em] mt-3">Synchronized Operational Environment</p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 justify-items-center">
          {cards.map((item, idx) => (
            <CommandCard key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}