'use client';

import {
  IndianRupee,
  TrendingUp,
  Wheat,
  Users,
  Skull,
  Loader2,
  Syringe,
  TrendingDown,
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { StatCard } from '@/components/stat-card';
import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';

export default function OverviewPage() {
  const { totalSheep, totalExpenses, totalSales, isLoading, totalFeedCost, totalLaborCost, totalDead, totalMedicineCost, totalReceivables, totalPayables } = useFarm();
  
  if (isLoading) {
    return (
       <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Farm Overview"
        description="A quick glance at your farm's key metrics."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
            title="Live Sheep"
            value={totalSheep.toString()}
            icon={SheepIcon}
            description="Total live sheep in your farm"
        />
         <StatCard
            title="Dead Sheep"
            value={totalDead.toString()}
            icon={Skull}
            description="Total recorded deaths"
        />
        <StatCard
            title="Total Sales"
            value={`₹${totalSales.toFixed(2)}`}
            icon={TrendingUp}
            description="Total sales made"
        />
        <StatCard
            title="Total Expenses"
            value={`₹${totalExpenses.toFixed(2)}`}
            icon={IndianRupee}
            description="Total expenses incurred"
        />
        <StatCard
            title="Feed Cost"
            value={`₹${totalFeedCost.toFixed(2)}`}
            icon={Wheat}
            description="Total feed expenses"
        />
        <StatCard
            title="Employee Cost"
            value={`₹${totalLaborCost.toFixed(2)}`}
            icon={Users}
            description="Total employee expenses"
        />
        <StatCard
            title="Medicine Cost"
            value={`₹${totalMedicineCost.toFixed(2)}`}
            icon={Syringe}
            description="Total medicine expenses"
        />
         <StatCard
          title="Receivables"
          value={`₹${totalReceivables.toFixed(2)}`}
          icon={TrendingUp}
          description="Money owed to you from sales"
        />
        <StatCard
          title="Payables"
          value={`₹${totalPayables.toFixed(2)}`}
          icon={TrendingDown}
          description="Money you owe for purchases"
        />
      </div>
    </div>
  );
}
