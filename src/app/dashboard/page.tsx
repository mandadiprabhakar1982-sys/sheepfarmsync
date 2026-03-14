
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
  ChevronRight,
  Monitor
} from 'lucide-react';
import { SyncProIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const { userRole, isLoadingProfile } = useFarm();
  const { t } = useLanguage();
  const isAdmin = userRole === 'admin';

  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id);

  const menuItems = [
    {
      title: "OVERVIEW ANALYTICS",
      icon: LayoutDashboard,
      href: '/dashboard/overview',
      color: 'bg-blue-500/20 text-blue-400',
      border: 'border-blue-500/30',
      glow: 'shadow-blue-500/20',
      asset: getImg('dash-analytics')
    },
    {
      title: "MONTHLY LEDGER",
      icon: Wallet,
      href: '/dashboard/monthly-ledger',
      color: 'bg-purple-500/20 text-purple-400',
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/20',
      adminOnly: true,
      asset: getImg('dash-ledger')
    },
    {
      title: "LIABILITIES",
      icon: BookOpen,
      href: '/dashboard/balance-sheet',
      color: 'bg-zinc-500/20 text-zinc-400',
      border: 'border-zinc-500/30',
      glow: 'shadow-zinc-500/20',
      adminOnly: true,
      asset: getImg('dash-liabilities')
    },
    {
      title: "FLOCK",
      icon: ClipboardList,
      href: '/dashboard/livestock',
      color: 'bg-cyan-500/20 text-cyan-400',
      border: 'border-cyan-500/30',
      glow: 'shadow-cyan-500/20',
      asset: getImg('dash-flock')
    },
    {
      title: "PURCHASES & SALES",
      icon: ArrowRightLeft,
      href: '/dashboard/sales',
      color: 'bg-emerald-500/20 text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
      isHighlight: true,
      asset: getImg('dash-sales')
    },
    {
      title: "HEALTH",
      icon: HeartPulse,
      href: '/dashboard/medicine',
      color: 'bg-rose-500/20 text-rose-400',
      border: 'border-rose-500/30',
      glow: 'shadow-rose-500/20',
      asset: getImg('dash-health')
    },
    {
      title: "FEED",
      icon: Wheat,
      href: '/dashboard/feed',
      color: 'bg-lime-500/20 text-lime-400',
      border: 'border-lime-500/30',
      glow: 'shadow-lime-500/20',
      asset: getImg('dash-feed')
    },
    {
      title: "LABOR",
      icon: Users,
      href: '/dashboard/labor',
      color: 'bg-orange-500/20 text-orange-400',
      border: 'border-orange-500/30',
      glow: 'shadow-orange-500/20',
      asset: getImg('dash-labor')
    },
    {
      title: "EXPENSES",
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-indigo-500/20 text-indigo-400',
      border: 'border-indigo-500/30',
      glow: 'shadow-indigo-500/20',
      asset: getImg('dash-expenses')
    },
  ];

  if (isLoadingProfile) return null;

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 md:p-8 relative">
      {/* COMMAND HUB CENTERED GLASS PANEL */}
      <section className="w-full max-w-[1400px] relative z-10">
        <div className="w-full bg-white/10 backdrop-blur-3xl rounded-[3rem] border border-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.1)] p-8 md:p-12 lg:p-16 relative overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="flex items-center gap-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="h-16 w-16 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="h-10 w-10 text-emerald-400 relative z-10 group-hover:scale-110 transition-transform">
                <SyncProIcon />
              </div>
            </div>
            <div className="space-y-0.5">
              <h1 className="text-3xl font-black tracking-tight uppercase text-neutral-800">
                SYSTEM COMMAND HUB
              </h1>
              <p className="text-[11px] font-bold text-neutral-500/60 uppercase tracking-[0.4em]">
                SYNCHRONIZED OPERATIONAL ENVIRONMENT
              </p>
            </div>
          </div>

          {/* DYNAMIC GRID - 5 items top row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
            {menuItems.slice(0, 5).map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              return (
                <Link href={item.href} key={item.title} className="group">
                  <Card className={cn(
                    "h-full border bg-white/30 backdrop-blur-xl rounded-[2.5rem] transition-all duration-500",
                    "hover:-translate-y-2 hover:bg-white/50 hover:shadow-2xl active:scale-95 border-white/60",
                    item.border,
                    item.glow,
                    item.isHighlight && "ring-2 ring-emerald-500/20",
                    "overflow-hidden relative"
                  )}>
                    <CardContent className="p-6 pb-10 flex flex-col items-center justify-center min-h-[240px] text-center relative">
                      <div className="w-28 h-28 mb-6 relative group-hover:scale-110 transition-transform duration-500">
                         {item.asset && (
                           <img 
                             src={item.asset.imageUrl} 
                             alt={item.title} 
                             className="w-full h-full object-contain filter drop-shadow-lg"
                             data-ai-hint={item.asset.imageHint}
                           />
                         )}
                      </div>
                      
                      <h3 className="text-[14px] font-black tracking-tight text-neutral-800 leading-none uppercase mb-4">
                        {item.title}
                      </h3>

                      {/* DECORATIVE ELEMENTS FROM DESIGN */}
                      <div className="w-full px-4 flex flex-col gap-2">
                        <div className="h-0.5 w-full bg-cyan-400/30 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[8px] font-black text-neutral-400 opacity-40 tracking-widest">...</span>
                          <span className="text-[8px] font-black text-neutral-400 opacity-40 tracking-widest">109</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* DYNAMIC GRID - 4 items bottom row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:max-w-[80%] mx-auto lg:mx-0">
            {menuItems.slice(5).map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              return (
                <Link href={item.href} key={item.title} className="group">
                  <Card className={cn(
                    "h-full border bg-white/30 backdrop-blur-xl rounded-[2.5rem] transition-all duration-500",
                    "hover:-translate-y-2 hover:bg-white/50 hover:shadow-2xl active:scale-95 border-white/60",
                    item.border,
                    item.glow,
                    "overflow-hidden relative"
                  )}>
                    <CardContent className="p-6 pb-10 flex flex-col items-center justify-center min-h-[220px] text-center relative">
                      <div className="w-24 h-24 mb-4 relative group-hover:scale-110 transition-transform duration-500">
                         {item.asset && (
                           <img 
                             src={item.asset.imageUrl} 
                             alt={item.title} 
                             className="w-full h-full object-contain filter drop-shadow-lg"
                             data-ai-hint={item.asset.imageHint}
                           />
                         )}
                      </div>
                      
                      <h3 className="text-[14px] font-black tracking-tight text-neutral-800 leading-none uppercase mb-4">
                        {item.title}
                      </h3>

                      {/* DECORATIVE ELEMENTS FROM DESIGN */}
                      <div className="w-full px-4 flex flex-col gap-2">
                        <div className="h-0.5 w-full bg-cyan-400/30 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[8px] font-black text-neutral-400 opacity-40 tracking-widest">...</span>
                          <span className="text-[8px] font-black text-neutral-400 opacity-40 tracking-widest">109</span>
                        </div>
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
