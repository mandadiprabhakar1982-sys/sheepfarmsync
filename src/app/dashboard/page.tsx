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
  Layers
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
      color: 'bg-blue-600',
      shadow: 'shadow-blue-500/40',
      border: 'border-blue-500/30',
      deco: <BarChart3 className="h-16 w-16 text-blue-500/10 absolute -right-2 -bottom-2" />
    },
    {
      title: "MONTHLY LEDGER",
      subtitle: "PRIVATE PROJECT ASSETS",
      icon: Wallet,
      href: '/dashboard/monthly-ledger',
      color: 'bg-purple-600',
      shadow: 'shadow-purple-500/40',
      border: 'border-purple-500/30',
      adminOnly: true,
      deco: <TrendingUp className="h-16 w-16 text-purple-500/10 absolute -right-2 -bottom-2" />
    },
    {
      title: "LIABILITIES",
      subtitle: "PRIVATE PROJECT ASSETS",
      icon: BookOpen,
      href: '/dashboard/balance-sheet',
      color: 'bg-zinc-900',
      shadow: 'shadow-zinc-500/40',
      border: 'border-zinc-500/30',
      adminOnly: true,
      deco: <Activity className="h-16 w-16 text-zinc-500/10 absolute -right-2 -bottom-2" />
    },
    {
      title: "FLOCK",
      subtitle: "PUBLIC PROJECT ASSETS",
      icon: ClipboardList,
      href: '/dashboard/livestock',
      color: 'bg-teal-600',
      shadow: 'shadow-teal-500/40',
      border: 'border-teal-500/30',
      deco: <div className="absolute -right-4 -bottom-4 opacity-10 grayscale brightness-200"><img src="https://picsum.photos/seed/sheep-deco/200/200" alt="deco" className="w-32 h-32 object-contain" /></div>
    },
    {
      title: "PURCHASES & SALES",
      subtitle: "PUBLIC PROJECT ASSETS",
      icon: ArrowRightLeft,
      href: '/dashboard/sales',
      color: 'bg-green-600',
      shadow: 'shadow-green-500/40',
      border: 'border-green-500/30',
      deco: <Layers className="h-16 w-16 text-green-500/10 absolute -right-2 -bottom-2" />
    },
    {
      title: "HEALTH",
      subtitle: "OPERATIONS & STAFF",
      icon: HeartPulse,
      href: '/dashboard/medicine',
      color: 'bg-rose-600',
      shadow: 'shadow-rose-500/40',
      border: 'border-rose-500/30'
    },
    {
      title: "FEED",
      subtitle: "OPERATIONS & STAFF",
      icon: Wheat,
      href: '/dashboard/feed',
      color: 'bg-lime-600',
      shadow: 'shadow-lime-500/40',
      border: 'border-lime-500/30'
    },
    {
      title: "LABOR",
      subtitle: "OPERATIONS & STAFF",
      icon: Users,
      href: '/dashboard/labor',
      color: 'bg-orange-600',
      shadow: 'shadow-orange-500/40',
      border: 'border-orange-500/30'
    },
    {
      title: "EXPENSES",
      subtitle: "PUBLIC PROJECT ASSETS",
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-slate-600',
      shadow: 'shadow-slate-500/40',
      border: 'border-slate-500/30'
    },
  ];

  if (isLoadingProfile) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0a0a] text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div 
        className="absolute inset-0 bg-[url('https://picsum.photos/seed/farm-bg/1920/1080')] opacity-10 grayscale brightness-50 mix-blend-overlay"
        data-ai-hint="futuristic laboratory"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]" />

      {/* GLOW EFFECTS */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <section className="w-full max-w-[1600px] relative z-10">
        {/* COMMAND HUB PANEL */}
        <div className="w-full bg-white/[0.02] backdrop-blur-3xl rounded-[3.5rem] border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.6)] p-10 md:p-16 lg:p-20 relative">
          {/* DECORATIVE CORNER ACCENTS */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-white/5 rounded-tl-[3.5rem]" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-white/5 rounded-br-[3.5rem]" />

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center gap-8 mb-20 animate-in fade-in slide-in-from-top-10 duration-1000">
            <div className="h-20 w-20 rounded-[2rem] bg-[#111] border border-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
              <Sparkles className="h-10 w-10 text-emerald-400 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-white drop-shadow-2xl">
                System Command Hub
              </h1>
              <p className="text-[12px] md:text-[14px] font-black text-emerald-400/50 uppercase tracking-[0.5em]">
                Synchronized Operational Environment
              </p>
            </div>
          </div>

          {/* DYNAMIC GRID - 5 items top row, 4 items bottom row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Top Row - 5 Items */}
            {menuItems.slice(0, 5).map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title} className="group h-full">
                  <Card className={cn(
                    "h-full border bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] transition-all duration-500",
                    "hover:-translate-y-3 hover:bg-white/[0.07] hover:shadow-2xl active:scale-95",
                    item.border,
                    "overflow-hidden relative"
                  )}>
                    <CardContent className="p-8 flex flex-col justify-between h-full min-h-[240px]">
                      <div className="flex justify-between items-start">
                        <div className={cn(
                          "rounded-[1.5rem] p-5 text-white shadow-2xl transition-all duration-500",
                          "group-hover:scale-110 group-hover:rotate-6",
                          item.color,
                          item.shadow,
                          "border border-white/20"
                        )}>
                          <Icon className="h-7 w-7" />
                        </div>
                      </div>
                      <div className="mt-8 space-y-1 relative z-10">
                        <h3 className="text-xl font-black tracking-tight text-white leading-none">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mt-6 lg:mt-8 max-w-[80%] mx-auto lg:mx-0">
            {/* Bottom Row - 4 Items */}
            {menuItems.slice(5).map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title} className="group h-full">
                  <Card className={cn(
                    "h-full border bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] transition-all duration-500",
                    "hover:-translate-y-3 hover:bg-white/[0.07] hover:shadow-2xl active:scale-95",
                    item.border,
                    "overflow-hidden relative"
                  )}>
                    <CardContent className="p-8 flex flex-col justify-between h-full min-h-[220px]">
                      <div className="flex justify-between items-start">
                        <div className={cn(
                          "rounded-[1.5rem] p-5 text-white shadow-2xl transition-all duration-500",
                          "group-hover:scale-110 group-hover:rotate-6",
                          item.color,
                          item.shadow,
                          "border border-white/20"
                        )}>
                          <Icon className="h-7 w-7" />
                        </div>
                      </div>
                      <div className="mt-8 space-y-1 relative z-10">
                        <h3 className="text-lg font-black tracking-tight text-white leading-none uppercase">
                          {item.title}
                        </h3>
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-widest leading-relaxed">
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
