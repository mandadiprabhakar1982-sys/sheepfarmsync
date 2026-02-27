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
  BarChart,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'DASHBOARD',
    description: 'REAL-TIME FLOCK ANALYTICS',
    icon: LayoutDashboard,
    href: '/dashboard/overview',
    color: 'bg-blue-500',
  },
  {
    title: 'FLOCK TRACKING',
    description: 'WEIGHT & GROWTH LOGS',
    icon: ClipboardList,
    href: '/dashboard/livestock',
    color: 'bg-emerald-500',
  },
  {
    title: 'PURCHASE ANIMALS',
    description: 'NEW STOCK ACQUISITIONS',
    icon: ShoppingBag,
    href: '/dashboard/purchase',
    color: 'bg-amber-500',
  },
  {
    title: 'MEDICINE COST',
    description: 'HEALTH & VACCINATION',
    icon: HeartPulse,
    href: '/dashboard/medicine',
    color: 'bg-rose-500',
  },
  {
    title: 'FEED COST',
    description: 'NUTRITION MANAGEMENT',
    icon: Wheat,
    href: '/dashboard/feed',
    color: 'bg-lime-500',
  },
  {
    title: 'LABOUR COST',
    description: 'STAFF & WAGES',
    icon: Users,
    href: '/dashboard/labor',
    color: 'bg-orange-500',
  },
  {
    title: 'ANIMAL SALE',
    description: 'REVENUE & TRADES',
    icon: BadgeIndianRupee,
    href: '/dashboard/sales',
    color: 'bg-green-600',
  },
  {
    title: 'REPORTS',
    description: 'GROWTH INSIGHTS',
    icon: BarChart,
    href: '/dashboard/analysis',
    color: 'bg-indigo-500',
  },
];

export default function DashboardPage() {
  const { isLoading } = useFarm();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <section className="dashboard-hero text-white pt-16 pb-32 text-center">
        <div className="container mx-auto px-6">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-6 rounded-full">
              <SheepIcon className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-widest mb-4">
            SHEEPSYNC PRO
          </h1>
          <p className="text-sm md:text-base font-bold tracking-[0.3em] uppercase opacity-80">
            PRECISION MANAGEMENT FOR MODERN SHEPHERDS
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title} className="group">
                <Card className="border-none shadow-2xl rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 active:scale-95 bg-white overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center gap-6">
                    <div className={cn("rounded-3xl p-6 text-white shadow-lg transition-transform group-hover:scale-110", item.color)}>
                      <Icon className="h-12 w-12" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl tracking-tight text-foreground">{item.title}</h3>
                      <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground/30 mt-4" />
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
