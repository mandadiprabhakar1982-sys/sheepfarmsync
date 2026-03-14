'use client';

import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { 
  LayoutGrid, 
  Database, 
  Dna, 
  Leaf, 
  Users, 
  ArrowRightLeft,
  Skull,
  Wallet,
  Lock,
  Search,
  FlaskConical
} from 'lucide-react';
import { SheepIcon, HighFidelityLiabilities, DashboardSparkleIcon } from '@/components/logo';

export default function DashboardPage() {
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const cards = [
    { 
      title: "OVERVIEW", 
      subtitle: "... ANALYTICS ...", 
      icon: LayoutGrid, 
      href: '/dashboard/overview' 
    },
    { 
      title: "MONTHLY LEDGER", 
      subtitle: "PRIVATE PROJECT ASSETS", 
      icon: (props: any) => (
        <div className="relative">
          <Database {...props} />
          <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-emerald-900 bg-white rounded-full p-0.5" />
        </div>
      ), 
      href: '/dashboard/monthly-ledger', 
      adminOnly: true 
    },
    { 
      title: "LIABILITIES", 
      subtitle: "PRIVATE PROJECT ASSETS", 
      icon: HighFidelityLiabilities, 
      href: '/dashboard/balance-sheet', 
      adminOnly: true 
    },
    { 
      title: "FLOCK", 
      subtitle: "... PUBLIC PROJECT ASSETS ...", 
      icon: SheepIcon, 
      href: '/dashboard/livestock' 
    },
    { 
      title: "HEALTH", 
      subtitle: "... OPERATIONS & STAFF ...", 
      icon: Dna, 
      href: '/dashboard/medicine' 
    },
    { 
      title: "FEED", 
      subtitle: "... OPERATIONS & STAFF ...", 
      icon: (props: any) => (
        <div className="flex items-center gap-0.5">
          <FlaskConical {...props} />
          <Leaf className="h-4 w-4 text-emerald-400 -ml-2 mb-4" />
        </div>
      ), 
      href: '/dashboard/feed' 
    },
    { 
      title: "LABOR", 
      subtitle: "... OPERATIONS & STAFF ...", 
      icon: Users, 
      href: '/dashboard/labor' 
    },
    { 
      title: "EXPENSES", 
      subtitle: "... PUBLIC PROJECT ASSETS ...", 
      icon: (props: any) => (
        <div className="relative">
          <Wallet {...props} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-900">$</div>
        </div>
      ), 
      href: '/dashboard/expenses' 
    },
  ];

  const CommandCard = ({ item }: { item: any }) => {
    if (item.adminOnly && !isAdmin) return null;
    const Icon = item.icon;

    return (
      <div className="flex flex-col items-center gap-4 group">
        <Link href={item.href} className="module-card">
          <div className="card-icon-container">
            <Icon className="w-16 h-16 text-white" />
          </div>
          <h3 className="card-title mt-2">{item.title}</h3>
          <p className="card-subtitle opacity-60">{item.subtitle}</p>
        </Link>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 animate-in fade-in duration-700">
      <div className="w-full max-w-[1200px] space-y-12">
        {/* Header Hero Section */}
        <div className="flex items-center gap-6 mb-16 pl-4">
          <DashboardSparkleIcon className="h-16 w-16" />
          <div>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900 leading-none">SYSTEM COMMAND HUB</h1>
            <p className="text-[12px] font-bold text-neutral-400 uppercase tracking-[0.3em] mt-3">SYNCHRONIZED OPERATIONAL ENVIRONMENT</p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12 justify-items-center">
          {cards.map((item, idx) => (
            <CommandCard key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}