'use client';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  HeartPulse,
  Wheat,
  Users,
  BadgeIndianRupee,
  Receipt,
  BookOpen,
  Wallet,
  ShieldCheck,
  ChevronRight,
  Sparkles
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
      title: t('overview').toUpperCase(),
      description: t('analytics').toUpperCase(),
      icon: LayoutDashboard,
      href: '/dashboard/overview',
      color: 'bg-blue-600',
    },
    {
      title: t('ledger').toUpperCase(),
      description: t('private_suite').toUpperCase(),
      icon: Wallet,
      href: '/dashboard/monthly-ledger',
      color: 'bg-indigo-600',
      adminOnly: true,
      isPrivate: true,
    },
    {
      title: t('liabilities').toUpperCase(),
      description: t('private_suite').toUpperCase(),
      icon: BookOpen,
      href: '/dashboard/balance-sheet',
      color: 'bg-slate-700',
      adminOnly: true,
      isPrivate: true,
    },
    {
      title: t('flock').toUpperCase(),
      description: t('public_suite').toUpperCase(),
      icon: ClipboardList,
      href: '/dashboard/livestock',
      color: 'bg-emerald-600',
    },
    {
      title: t('buy').toUpperCase(),
      description: t('public_suite').toUpperCase(),
      icon: ShoppingBag,
      href: '/dashboard/purchase',
      color: 'bg-amber-500',
    },
    {
      title: t('health').toUpperCase(),
      description: t('ops_suite').toUpperCase(),
      icon: HeartPulse,
      href: '/dashboard/medicine',
      color: 'bg-rose-500',
    },
    {
      title: t('feed').toUpperCase(),
      description: t('ops_suite').toUpperCase(),
      icon: Wheat,
      href: '/dashboard/feed',
      color: 'bg-lime-600',
    },
    {
      title: t('labor').toUpperCase(),
      description: t('ops_suite').toUpperCase(),
      icon: Users,
      href: '/dashboard/labor',
      color: 'bg-orange-500',
    },
    {
      title: t('sales').toUpperCase(),
      description: t('public_suite').toUpperCase(),
      icon: BadgeIndianRupee,
      href: '/dashboard/sales',
      color: 'bg-green-700',
    },
    {
      title: t('expenses').toUpperCase(),
      description: t('public_suite').toUpperCase(),
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-slate-500',
    },
  ];

  if (isLoadingProfile) return null;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 animate-in fade-in duration-500">
      {/* MOBILE HUB HEADER */}
      <section className="md:hidden bg-primary text-white pt-10 pb-16 text-center px-6">
        <div className="flex justify-center mb-4">
          <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
            <SyncProIcon className="h-8 w-8 text-accent" />
          </div>
        </div>
        <h1 className="text-[24px] font-black tracking-tight uppercase">
          {t('dashboard_hero')}
        </h1>
        <p className="text-[12px] font-bold tracking-[0.2em] uppercase opacity-60 mt-1">
          {t('dashboard_desc')}
        </p>
      </section>

      {/* DESKTOP WELCOME HEADER */}
      <section className="hidden md:block container mx-auto px-10 py-12">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[2rem] bg-neutral-900 flex items-center justify-center shadow-2xl">
            <Sparkles className="h-10 w-10 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-[24px] font-black text-neutral-900 uppercase tracking-tight">System Command Hub</h1>
            <p className="text-[14px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Synchronized Operational Environment</p>
          </div>
        </div>
      </section>

      {/* ADAPTIVE MENU GRID */}
      <section className="container mx-auto px-4 md:px-10 -mt-10 md:mt-0 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {menuItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            
            return (
              <Link href={item.href} key={item.title} className="group">
                <Card className={cn(
                  "border-none shadow-xl rounded-[2rem] transition-all duration-300 hover:-translate-y-1 active:scale-95 bg-white overflow-hidden relative h-full",
                  item.isPrivate && "ring-2 ring-emerald-500/5"
                )}>
                  {item.isPrivate && (
                    <div className="absolute top-4 right-4 opacity-20">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center gap-4">
                    <div className={cn("rounded-3xl p-5 text-white shadow-lg transition-transform group-hover:scale-110", item.color)}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[14px] font-black tracking-tight text-neutral-900 leading-none">{item.title}</h3>
                      <p className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                        {item.description}
                      </p>
                    </div>
                    <div className="md:hidden mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-primary/20" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
