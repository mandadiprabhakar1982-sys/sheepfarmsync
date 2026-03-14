'use client';
import Link from 'next/link';
import {
  LayoutGrid,
  HeartPulse,
  Wheat,
  Users,
  Receipt,
  BookOpen,
  Wallet,
  ArrowRightLeft,
  ClipboardList,
} from 'lucide-react';
import { DashboardSparkleIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { userRole, isLoadingProfile } = useFarm();
  const isAdmin = userRole === 'admin';

  const menuItems = [
    {
      title: "OVERVIEW",
      subtitle: "ANALYTICS",
      icon: LayoutGrid,
      href: '/dashboard/overview',
      color: 'bg-blue-600',
    },
    {
      title: "MONTHLY LEDGER",
      subtitle: "PRIVATE PROJECT ASSETS",
      icon: Wallet,
      href: '/dashboard/monthly-ledger',
      color: 'bg-purple-600',
      adminOnly: true,
    },
    {
      title: "LIABILITIES",
      subtitle: "PRIVATE PROJECT ASSETS",
      icon: BookOpen,
      href: '/dashboard/balance-sheet',
      color: 'bg-slate-800',
      adminOnly: true,
    },
    {
      title: "FLOCK",
      subtitle: "PUBLIC PROJECT ASSETS",
      icon: ClipboardList,
      href: '/dashboard/livestock',
      color: 'bg-emerald-600',
    },
    {
      title: "HEALTH",
      subtitle: "OPERATIONS & STAFF",
      icon: HeartPulse,
      href: '/dashboard/medicine',
      color: 'bg-rose-500',
    },
    {
      title: "FEED",
      subtitle: "OPERATIONS & STAFF",
      icon: Wheat,
      href: '/dashboard/feed',
      color: 'bg-lime-600',
    },
    {
      title: "LABOR",
      subtitle: "OPERATIONS & STAFF",
      icon: Users,
      href: '/dashboard/labor',
      color: 'bg-orange-500',
    },
    {
      title: "EXPENSES",
      subtitle: "PUBLIC PROJECT ASSETS",
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-neutral-700',
    },
    {
      title: "HEALTH",
      subtitle: "OPERATIONS & STAFF",
      icon: HeartPulse,
      href: '/dashboard/medicine',
      color: 'bg-rose-500',
    },
    {
      title: "FEED",
      subtitle: "OPERATIONS & STAFF",
      icon: Wheat,
      href: '/dashboard/feed',
      color: 'bg-lime-600',
    },
    {
      title: "EXPENSES",
      subtitle: "PUBLIC PROJECT ASSETS",
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-slate-700',
    },
  ];

  if (isLoadingProfile) return null;

  return (
    <div className="min-h-[calc(100vh-140px)] p-4 md:p-10 lg:p-16">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
        <DashboardSparkleIcon />
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">
            SYSTEM COMMAND HUB
          </h1>
          <p className="text-[12px] font-bold text-neutral-400 uppercase tracking-[0.25em]">
            SYNCHRONIZED OPERATIONAL ENVIRONMENT
          </p>
        </div>
      </div>

      {/* TACTICAL 4-COLUMN GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {menuItems.map((item, index) => {
          if (item.adminOnly && !isAdmin) return null;
          const Icon = item.icon;
          
          return (
            <Link href={item.href} key={index} className="group">
              <Card className={cn(
                "border-none bg-white/40 backdrop-blur-md rounded-[2.5rem] transition-all duration-500",
                "hover:-translate-y-2 hover:bg-white/60 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] active:scale-95 shadow-sm",
                "h-full min-h-[220px] overflow-hidden"
              )}>
                <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full space-y-6">
                  {/* ICON CONTAINER */}
                  <div className={cn(
                    "h-16 w-16 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110 duration-500",
                    item.color
                  )}>
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  {/* TEXT LABELS */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black tracking-tight text-neutral-900 uppercase">
                      {item.title}
                    </h3>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest opacity-60">
                      {item.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
