'use client';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  HeartPulse,
  Wheat,
  Users,
  Receipt,
  BookOpen,
  Wallet,
  Sparkles,
  ArrowRightLeft,
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { SyncProIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { userRole, isLoadingProfile } = useFarm();
  const { t } = useLanguage();
  const isAdmin = userRole === 'admin';

  const menuItems = [
    {
      title: "OVERVIEW",
      subtitle: "ANALYTICS",
      icon: LayoutDashboard,
      href: '/dashboard/overview',
      color: 'bg-blue-500',
      neon: 'border-blue-400/50 shadow-blue-400/20',
      iconShadow: 'shadow-blue-500/40'
    },
    {
      title: "MONTHLY LEDGER",
      subtitle: "PRIVATE PROJECT ASSETS",
      icon: Wallet,
      href: '/dashboard/monthly-ledger',
      color: 'bg-purple-500',
      neon: 'border-purple-400/50 shadow-purple-400/20',
      iconShadow: 'shadow-purple-500/40',
      adminOnly: true
    },
    {
      title: "LIABILITIES",
      subtitle: "PRIVATE PROJECT ASSETS",
      icon: BookOpen,
      href: '/dashboard/balance-sheet',
      color: 'bg-zinc-700',
      neon: 'border-zinc-400/50 shadow-zinc-400/20',
      iconShadow: 'shadow-zinc-700/40',
      adminOnly: true
    },
    {
      title: "FLOCK",
      subtitle: "PUBLIC PROJECT ASSETS",
      icon: ClipboardList,
      href: '/dashboard/livestock',
      color: 'bg-cyan-500',
      neon: 'border-cyan-400/50 shadow-cyan-400/20',
      iconShadow: 'shadow-cyan-500/40',
      deco: <img src="https://picsum.photos/seed/sheep-deco/200/200" alt="deco" className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-16 object-contain opacity-80" />
    },
    {
      title: "PURCHASES & SALES",
      subtitle: "PUBLIC PROJECT ASSETS",
      icon: ArrowRightLeft,
      href: '/dashboard/sales',
      color: 'bg-emerald-500',
      neon: 'border-emerald-400/50 shadow-emerald-400/20',
      iconShadow: 'shadow-emerald-500/40',
    },
    {
      title: "HEALTH",
      subtitle: "OPERATIONS & STAFF",
      icon: HeartPulse,
      href: '/dashboard/medicine',
      color: 'bg-rose-500',
      neon: 'border-rose-400/50 shadow-rose-400/20',
      iconShadow: 'shadow-rose-500/40'
    },
    {
      title: "FEED",
      subtitle: "OPERATIONS & STAFF",
      icon: Wheat,
      href: '/dashboard/feed',
      color: 'bg-lime-500',
      neon: 'border-lime-400/50 shadow-lime-400/20',
      iconShadow: 'shadow-lime-500/40'
    },
    {
      title: "LABOR",
      subtitle: "OPERATIONS & STAFF",
      icon: Users,
      href: '/dashboard/labor',
      color: 'bg-orange-500',
      neon: 'border-orange-400/50 shadow-orange-400/20',
      iconShadow: 'shadow-orange-500/40'
    },
    {
      title: "EXPENSES",
      subtitle: "PUBLIC PROJECT ASSETS",
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-indigo-500',
      neon: 'border-indigo-400/50 shadow-indigo-400/20',
      iconShadow: 'shadow-indigo-500/40'
    },
  ];

  if (isLoadingProfile) return null;

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 md:p-8 relative">
      {/* COMMAND HUB CENTERED GLASS PANEL */}
      <section className="w-full max-w-[1400px] relative z-10">
        <div className="w-full bg-white/20 backdrop-blur-3xl rounded-[3rem] border border-white/60 shadow-[0_40px_100px_rgba(0,0,0,0.1)] p-8 md:p-12 lg:p-16 relative overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="flex items-center gap-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="h-16 w-16 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <Sparkles className="h-8 w-8 text-emerald-400 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-3xl font-black tracking-tight uppercase text-neutral-800">
                System Command Hub
              </h1>
              <p className="text-[11px] font-bold text-neutral-500/60 uppercase tracking-[0.4em]">
                Synchronized Operational Environment
              </p>
            </div>
          </div>

          {/* DYNAMIC GRID - 5 items top row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
            {menuItems.slice(0, 5).map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title} className="group">
                  <Card className={cn(
                    "h-full border bg-white/40 backdrop-blur-xl rounded-[2rem] transition-all duration-500",
                    "hover:-translate-y-2 hover:bg-white/60 hover:shadow-xl active:scale-95 border-white/60",
                    item.neon,
                    "overflow-hidden relative"
                  )}>
                    <CardContent className="p-6 flex flex-col justify-between min-h-[200px]">
                      <div className="flex justify-between items-start">
                        <div className={cn(
                          "rounded-2xl p-4 text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                          item.color,
                          item.iconShadow,
                          "border border-white/20"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-6 space-y-1 relative z-10">
                        <h3 className="text-[15px] font-black tracking-tight text-neutral-800 leading-none">
                          {item.title}
                        </h3>
                        <p className="text-[9px] text-neutral-500/60 font-bold uppercase tracking-widest">
                          {item.subtitle}
                        </p>
                      </div>
                      {item.deco}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* DYNAMIC GRID - 4 items bottom row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-[80%] mx-auto lg:mx-0">
            {menuItems.slice(5).map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title} className="group">
                  <Card className={cn(
                    "h-full border bg-white/40 backdrop-blur-xl rounded-[2rem] transition-all duration-500",
                    "hover:-translate-y-2 hover:bg-white/60 hover:shadow-xl active:scale-95 border-white/60",
                    item.neon,
                    "overflow-hidden relative"
                  )}>
                    <CardContent className="p-6 flex flex-col justify-between min-h-[180px]">
                      <div className="flex justify-between items-start">
                        <div className={cn(
                          "rounded-2xl p-4 text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                          item.color,
                          item.iconShadow,
                          "border border-white/20"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-6 space-y-1 relative z-10">
                        <h3 className="text-[14px] font-black tracking-tight text-neutral-800 leading-none uppercase">
                          {item.title}
                        </h3>
                        <p className="text-[8px] text-neutral-500/60 font-bold uppercase tracking-widest">
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
      </section>
    </div>
  );
}
