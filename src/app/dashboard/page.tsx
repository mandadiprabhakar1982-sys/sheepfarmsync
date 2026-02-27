
'use client';
import Link from 'next/link';
import {
  ListChecks,
  HeartPulse,
  Wheat,
  Users,
  ChevronRight,
  BadgeIndianRupee,
  LayoutDashboard,
  Package,
  Loader2,
  Skull,
  BarChart,
  Receipt,
  Calculator,
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';

const menuItems = [
    {
      title: 'Overview',
      description: 'Farm at a glance',
      icon: LayoutDashboard,
      href: '/dashboard/overview',
    },
    {
      title: 'Reports & Analysis',
      description: 'AI-powered insights',
      icon: BarChart,
      href: '/dashboard/analysis',
    },
    {
      title: 'Sheep Management',
      description: 'Weight & growth logs',
      icon: ListChecks,
      href: '/dashboard/livestock',
    },
    {
      title: 'Purchase Sheep',
      description: 'Record sheep purchases',
      icon: Package,
      href: '/dashboard/purchase',
    },
    {
      title: 'Sheep Sales',
      description: 'Record sheep sales',
      icon: BadgeIndianRupee,
      href: '/dashboard/sales',
    },
    {
      title: 'Medicine',
      description: 'Vaccinations & treatments',
      icon: HeartPulse,
      href: '/dashboard/medicine',
    },
    {
      title: 'Feed Cost',
      description: 'Nutrition management',
      icon: Wheat,
      href: '/dashboard/feed',
    },
    {
      title: 'Feed Calculator',
      description: 'Estimate feed needs & costs',
      icon: Calculator,
      href: '/dashboard/feed-calculator',
    },
    {
      title: 'Employee Cost',
      description: 'Manage employees',
      icon: Users,
      href: '/dashboard/labor',
    },
    {
      title: 'Farm Expenses',
      description: 'Miscellaneous costs',
      icon: Receipt,
      href: '/dashboard/expenses',
    },
    {
      title: 'Mortality',
      description: 'Track animal deaths',
      icon: Skull,
      href: '/dashboard/mortality',
    },
  ];


export default function DashboardPage() {
  const { isLoading } = useFarm();
  
  if (isLoading) {
    return (
       <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto text-center py-12 md:py-20">
            <div className="inline-block bg-white/10 rounded-2xl p-4">
                <SheepIcon className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
            SheepSync Pro
          </h1>
          <p className="mt-2 text-lg md:text-xl text-primary-foreground/80">
            Precision Management for Modern Shepherds
          </p>
        </div>
      </section>
      
      <section className="container mx-auto px-4 py-8 md:py-12 -mt-12 md:-mt-16 relative z-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title} className="block group">
                <Card className="h-full border-none shadow-md transition-all duration-200 hover:ring-2 hover:ring-primary active:scale-95">
                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 text-center gap-3">
                    <div className="rounded-2xl bg-accent p-3 sm:p-4">
                       <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight">{item.title}</h3>
                      <p className="hidden sm:block text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
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
