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
    <>
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
      
      <section className="container mx-auto px-0 md:px-4 py-8 md:py-12 -mt-16 md:-mt-24">
        <div className="grid grid-flow-col auto-cols-[16rem] gap-4 overflow-x-auto pb-4 px-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:auto-cols-auto md:gap-6 md:px-0 md:pb-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title} className="block group rounded-lg">
                <Card className="h-full transition-all duration-200 group-hover:border-primary group-hover:shadow-lg">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-lg bg-accent p-3">
                       <Icon className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
