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
  Loader2,
  BookOpen,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import { SyncProIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { isLoading, userRole, isLoadingProfile } = useFarm();
  const { t } = useLanguage();
  const isAdmin = userRole === 'admin';

  const menuItems = [
    {
      title: t('overview').toUpperCase(),
      description: t('analytics').toUpperCase(),
      icon: LayoutDashboard,
      href: '/dashboard/overview',
      color: 'bg-blue-500',
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
      color: 'bg-emerald-500',
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
      color: 'bg-lime-500',
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
      color: 'bg-green-600',
    },
    {
      title: t('expenses').toUpperCase(),
      description: t('public_suite').toUpperCase(),
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-slate-500',
    },
  ];

  // If identity is still being verified, show nothing to prevent jumping
  if (isLoadingProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 animate-in fade-in duration-500">
      <section className="dashboard-hero text-white pt-10 pb-16 text-center">
        <div className="container mx-auto px-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <SyncProIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-widest mb-2 uppercase">
            {t('dashboard_hero')}
          </h1>
          <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-80">
            {t('dashboard_desc')}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8">
          {menuItems.map((item) => {
            // Hide admin-only items for other users
            if (item.adminOnly && !isAdmin) return null;

            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title} className="group">
                <Card className={cn(
                  "border-none shadow-xl rounded-[1.5rem] md:rounded-[2rem] transition-all duration-300 hover:-translate-y-1 active:scale-95 bg-white overflow-hidden relative",
                  item.isPrivate && "ring-2 ring-emerald-500/10"
                )}>
                  {item.isPrivate && (
                    <div className="absolute top-4 right-4 opacity-20">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                  <CardContent className="flex flex-col items-center justify-center p-6 md:p-8 text-center gap-3 md:gap-4">
                    <div className={cn("rounded-2xl md:rounded-3xl p-4 md:p-5 text-white shadow-md transition-transform group-hover:scale-110", item.color)}>
                      <Icon className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs md:text-sm tracking-tight text-foreground leading-none">{item.title}</h3>
                      <p className="hidden md:block text-[8px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">
                        {item.description}
                      </p>
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
