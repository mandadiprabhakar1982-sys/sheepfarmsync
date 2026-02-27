'use client';
import Link from 'next/link';
import {
  ListChecks,
  HeartPulse,
  Wheat,
  Users,
  BadgeIndianRupee,
  LayoutDashboard,
  Package,
  Loader2,
  Skull,
  BarChart,
  Receipt,
  Calculator,
  Globe,
  ChevronRight,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';

const menuItems = [
    {
      title: 'Overview',
      description: 'Analytics & Trends',
      icon: LayoutDashboard,
      href: '/dashboard/overview',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Marketplace',
      description: 'Global Community',
      icon: Globe,
      href: '/dashboard/marketplace',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'AI Intel',
      description: 'Cost Strategy',
      icon: BarChart,
      href: '/dashboard/analysis',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Flock Log',
      description: 'Growth & Audit',
      icon: ListChecks,
      href: '/dashboard/livestock',
      color: 'bg-teal-50 text-teal-700',
    },
    {
      title: 'Purchases',
      description: 'Asset Acquisition',
      icon: Package,
      href: '/dashboard/purchase',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Sales',
      description: 'Revenue Stream',
      icon: BadgeIndianRupee,
      href: '/dashboard/sales',
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Medical',
      description: 'Biosafety Protocols',
      icon: HeartPulse,
      href: '/dashboard/medicine',
      color: 'bg-rose-50 text-rose-700',
    },
    {
      title: 'Feed Bank',
      description: 'Inventory Control',
      icon: Wheat,
      href: '/dashboard/feed',
      color: 'bg-orange-50 text-orange-700',
    },
    {
      title: 'Estimator',
      description: 'Precise Rations',
      icon: Calculator,
      href: '/dashboard/feed-calculator',
      color: 'bg-cyan-50 text-cyan-700',
    },
    {
      title: 'Human Cap.',
      description: 'Labor Relations',
      icon: Users,
      href: '/dashboard/labor',
      color: 'bg-slate-50 text-slate-700',
    },
    {
      title: 'OpEx',
      description: 'Operating Costs',
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-gray-50 text-gray-700',
    },
    {
      title: 'Mortality',
      description: 'Incident Reports',
      icon: Skull,
      href: '/dashboard/mortality',
      color: 'bg-red-50 text-red-700',
    },
  ];

export default function DashboardPage() {
  const { isLoading, totalSheep } = useFarm();
  
  if (isLoading) {
    return (
       <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background pb-32">
      <section className="dashboard-hero bg-primary text-primary-foreground relative overflow-hidden py-12 md:py-24">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <SheepIcon className="h-96 w-96 rotate-[25deg]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-black uppercase tracking-widest mb-8 border border-white/5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Professional Edition v2.4
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
              Sync Your <br />
              <span className="text-accent">Operation.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl font-medium leading-relaxed">
              Monitoring <span className="text-white font-black underline decoration-accent/40">{totalSheep}</span> active livestock assets. Enterprise-grade precision for modern agriculture.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/help">
                <button className="bg-white text-primary px-10 py-4 rounded-2xl font-black shadow-2xl hover:bg-white/90 active:scale-95 transition-all flex items-center gap-3">
                  <Smartphone className="h-5 w-5" />
                  Install Mobile App
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title} className="group">
                <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 active:scale-95 bg-white/95 backdrop-blur-md">
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center gap-5">
                    <div className={cn("rounded-2xl p-5 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-inner", item.color)}>
                       <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-tight text-foreground">{item.title}</h3>
                      <p className="hidden sm:block text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-wider opacity-60">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <Card className="border-none shadow-xl bg-gradient-to-br from-white to-accent/20 group cursor-pointer hover:to-accent/40 transition-colors">
              <div className="p-10 flex flex-col justify-between h-full min-h-[240px]">
                <div>
                  <div className="bg-emerald-600/10 w-fit p-3 rounded-xl mb-4">
                    <BarChart className="h-6 w-6 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Growth Analytics</h3>
                  <p className="text-muted-foreground font-medium text-sm">Review performance metrics and weight gain velocity across your flock.</p>
                </div>
                <Link href="/dashboard/livestock" className="inline-flex items-center text-primary font-black text-xs uppercase tracking-widest mt-6 group-hover:translate-x-1 transition-transform">
                  Access Records <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
           </Card>

           <Card className="border-none shadow-xl bg-gradient-to-br from-white to-blue-50 group cursor-pointer hover:to-blue-100 transition-colors">
              <div className="p-10 flex flex-col justify-between h-full min-h-[240px]">
                <div>
                  <div className="bg-blue-600/10 w-fit p-3 rounded-xl mb-4">
                    <Globe className="h-6 w-6 text-blue-700" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Market Intel</h3>
                  <p className="text-muted-foreground font-medium text-sm">Analyze regional trends and trade with the global sheep community.</p>
                </div>
                <Link href="/dashboard/marketplace" className="inline-flex items-center text-primary font-black text-xs uppercase tracking-widest mt-6 group-hover:translate-x-1 transition-transform">
                  Launch Market <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
           </Card>

           <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-white group cursor-pointer overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <SheepIcon className="h-48 w-48" />
              </div>
              <div className="p-10 flex flex-col justify-between h-full min-h-[240px] relative z-10">
                <div>
                  <div className="bg-white/10 w-fit p-3 rounded-xl mb-4">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">System Status</h3>
                  <p className="text-white/70 font-medium text-sm">All biosafety and operational logs are synchronized and secured.</p>
                </div>
                <Link href="/dashboard/overview" className="inline-flex items-center text-accent font-black text-xs uppercase tracking-widest mt-6 group-hover:translate-x-1 transition-transform">
                  View System Health <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
           </Card>
        </div>
      </section>
    </div>
  );
}