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
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';

const menuItems = [
    {
      title: 'OVERVIEW',
      description: 'FARM AT A GLANCE',
      icon: LayoutDashboard,
      color: 'bg-teal-500',
      href: '/dashboard/overview',
    },
    {
      title: 'REPORTS & ANALYSIS',
      description: 'AI-POWERED INSIGHTS',
      icon: BarChart,
      color: 'bg-blue-500',
      href: '/dashboard/analysis',
    },
    {
      title: 'SHEEP MANAGEMENT',
      description: 'WEIGHT & GROWTH LOGS',
      icon: ListChecks,
      color: 'bg-green-500',
      href: '/dashboard/livestock',
    },
    {
      title: 'PURCHASE SHEEP',
      description: 'RECORD SHEEP PURCHASES',
      icon: Package,
      color: 'bg-cyan-500',
      href: '/dashboard/purchase',
    },
    {
      title: 'SHEEP SALES',
      description: 'RECORD SHEEP SALES',
      icon: BadgeIndianRupee,
      color: 'bg-purple-500',
      href: '/dashboard/sales',
    },
    {
      title: 'MEDICINE',
      description: 'VACCINATIONS & TREATMENTS',
      icon: HeartPulse,
      color: 'bg-red-500',
      href: '/dashboard/medicine',
    },
    {
      title: 'FEED COST',
      description: 'NUTRITION MANAGEMENT',
      icon: Wheat,
      color: 'bg-yellow-500',
      href: '/dashboard/feed',
    },
    {
      title: 'EMPLOYEE COST',
      description: 'MANAGE EMPLOYEES',
      icon: Users,
      color: 'bg-indigo-500',
      href: '/dashboard/labor',
    },
    {
      title: 'FARM EXPENSES',
      description: 'MISCELLANEOUS COSTS',
      icon: Receipt,
      color: 'bg-orange-500',
      href: '/dashboard/expenses',
    },
    {
      title: 'MORTALITY',
      description: 'TRACK ANIMAL DEATHS',
      icon: Skull,
      color: 'bg-gray-500',
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
            SHEEPSYNC PRO
          </h1>
          <p className="mt-2 text-lg md:text-xl text-primary-foreground/80">
            PRECISION MANAGEMENT FOR MODERN SHEPHERDS
          </p>
        </div>
      </section>
      
      <section className="container mx-auto px-4 py-8 md:py-12 -mt-16 md:-mt-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title} className="block">
                <Card className="group h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className={`mb-6 rounded-2xl p-4 ${item.color}`}>
                      <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="text-sm font-bold tracking-wider uppercase">{item.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    <ChevronRight className="mt-4 h-5 w-5 text-muted-foreground/30 transition-transform group-hover:translate-x-1" />
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
