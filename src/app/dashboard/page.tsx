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
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';

const menuItems = [
    {
      title: 'Overview',
      description: 'Key metrics & growth',
      icon: LayoutDashboard,
      href: '/dashboard/overview',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Marketplace',
      description: 'Community sales',
      icon: Globe,
      href: '/dashboard/marketplace',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'AI Analysis',
      description: 'Cost optimization',
      icon: BarChart,
      href: '/dashboard/analysis',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Flock Log',
      description: 'Growth tracking',
      icon: ListChecks,
      href: '/dashboard/livestock',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Purchases',
      description: 'Buy new livestock',
      icon: Package,
      href: '/dashboard/purchase',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Sales',
      description: 'Revenue records',
      icon: BadgeIndianRupee,
      href: '/dashboard/sales',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Health',
      description: 'Treatments & Meds',
      icon: HeartPulse,
      href: '/dashboard/medicine',
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Feed Manager',
      description: 'Stock & nutrition',
      icon: Wheat,
      href: '/dashboard/feed',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Calculator',
      description: 'Feed estimates',
      icon: Calculator,
      href: '/dashboard/feed-calculator',
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      title: 'Employees',
      description: 'Labor management',
      icon: Users,
      href: '/dashboard/labor',
      color: 'bg-slate-50 text-slate-600',
    },
    {
      title: 'Expenses',
      description: 'Other farm costs',
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-gray-50 text-gray-600',
    },
    {
      title: 'Mortality',
      description: 'Death records',
      icon: Skull,
      href: '/dashboard/mortality',
      color: 'bg-red-50 text-red-600',
    },
  ];


export default function DashboardPage() {
  const { isLoading, totalSheep } = useFarm();
  
  if (isLoading) {
    return (
       <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="dashboard-hero bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <SheepIcon className="h-64 w-64 rotate-12" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Active Farm Management
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              SheepSync Pro
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-xl">
              Currently monitoring <span className="text-white font-bold">{totalSheep}</span> sheep in your flock. Precision tracking for your peace of mind.
            </p>
            <Link href="/dashboard/overview">
              <button className="bg-white text-primary px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all">
                View Detailed Stats
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-4 py-8 md:py-12 -mt-12 relative z-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title} className="block group">
                <Card className="h-full border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-4">
                    <div className={cn("rounded-2xl p-4 transition-transform group-hover:scale-110", item.color)}>
                       <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight">{item.title}</h3>
                      <p className="hidden sm:block text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1 opacity-70">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="border-none shadow-sm bg-accent/30 overflow-hidden">
              <div className="p-8 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Growth Analysis</h3>
                  <p className="text-muted-foreground mb-6">Check how your flock is gaining weight this month.</p>
                </div>
                <Link href="/dashboard/livestock" className="inline-flex items-center text-primary font-bold hover:underline">
                  Go to Flock Logs <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
           </Card>
           <Card className="border-none shadow-sm bg-primary/5 overflow-hidden">
              <div className="p-8 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Market Trends</h3>
                  <p className="text-muted-foreground mb-6">See what other farmers are listing in the marketplace.</p>
                </div>
                <Link href="/dashboard/marketplace" className="inline-flex items-center text-primary font-bold hover:underline">
                  Browse Marketplace <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
           </Card>
        </div>
      </section>
    </div>
  );
}