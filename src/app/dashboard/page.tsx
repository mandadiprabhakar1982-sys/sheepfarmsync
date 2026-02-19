import Link from 'next/link';
import {
  BarChart,
  ListChecks,
  ShoppingBag,
  HeartPulse,
  Wheat,
  Users,
  ChevronRight,
  IndianRupee,
  TrendingUp,
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/stat-card';

const menuItems = [
    {
      title: 'DASHBOARD',
      description: 'REAL-TIME FLOCK ANALYTICS',
      icon: BarChart,
      color: 'bg-blue-500',
      href: '/dashboard',
    },
    {
      title: 'FLOCK TRACKING',
      description: 'WEIGHT & GROWTH LOGS',
      icon: ListChecks,
      color: 'bg-green-500',
      href: '/dashboard/livestock',
    },
    {
      title: 'PURCHASE ANIMALS',
      description: 'NEW STOCK ACQUISITIONS',
      icon: ShoppingBag,
      color: 'bg-orange-400',
      href: '/dashboard/livestock',
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
      title: 'LABOUR COST',
      description: 'MANAGE WORKFORCE',
      icon: Users,
      color: 'bg-indigo-500',
      href: '/dashboard/labor',
    },
  ];


export default function DashboardPage() {
  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto text-center py-12 md:py-20">
            <div className="inline-block bg-white/10 rounded-2xl p-4">
                <SheepIcon className="h-16 w-16 text-white" />
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
                title="Total Flock Size"
                value="1,250"
                icon={SheepIcon}
                description="Total sheep in your flock"
            />
            <StatCard
                title="Average Weight"
                value="55 kg"
                icon={BarChart}
                description="Across the entire flock"
            />
            <StatCard
                title="Total Expenses"
                value="₹2,50,000"
                icon={IndianRupee}
                description="+15% from last month"
            />
            <StatCard
                title="Total Sales"
                value="₹1,25,000"
                icon={TrendingUp}
                description="+5% from last month"
            />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title} className="block">
                <Card className="group h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className={`mb-6 rounded-2xl p-5 ${item.color}`}>
                      <Icon className="h-10 w-10 text-white" />
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
