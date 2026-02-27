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
  Receipt,
  ListChecks,
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { StatCard } from '@/components/stat-card';
import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';

export default function OverviewPage() {
  const { totalSheep, totalTracked, totalExpenses, totalSales, isLoading, totalFeedCost, totalLaborCost, totalMedicineCost, totalFarmExpenses, totalReceivables, totalPayables, totalDead } = useFarm();
  
  if (isLoading) {
    return (
       <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:py-8">
      <PageHeader
        title="Farm Overview"
        description="A quick glance at your farm's key metrics."
      />
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
            title="Live Sheep"
            value={totalSheep.toString()}
            icon={SheepIcon}
            description="Estimated flock inventory"
        />
        <StatCard
            title="Tracked Individually"
            value={totalTracked.toString()}
            icon={ListChecks}
            description="Total sheep in growth log"
        />
         <StatCard
            title="Recorded Deaths"
            value={totalDead.toString()}
            icon={Skull}
            description="Total recorded mortalities"
        />
        <StatCard
            title="Total Sales"
            value={`₹${totalSales.toLocaleString()}`}
            icon={TrendingUp}
            description="Total revenue received"
        />
        <StatCard
            title="Total Expenses"
            value={`₹${totalExpenses.toLocaleString()}`}
            icon={IndianRupee}
            description="Operational & purchase costs"
        />
        <StatCard
            title="Feed Cost"
            value={`₹${totalFeedCost.toLocaleString()}`}
            icon={Wheat}
            description="Total feed expenses"
        />
        <StatCard
            title="Employee Cost"
            value={`₹${totalLaborCost.toLocaleString()}`}
            icon={Users}
            description="Total labor & employee costs"
        />
        <StatCard
            title="Medicine Cost"
            value={`₹${totalMedicineCost.toLocaleString()}`}
            icon={Syringe}
            description="Total health care expenses"
        />
        <StatCard
            title="Other Expenses"
            value={`₹${totalFarmExpenses.toLocaleString()}`}
            icon={Receipt}
            description="Miscellaneous farm costs"
        />
         <StatCard
          title="Receivables"
          value={`₹${totalReceivables.toLocaleString()}`}
          icon={TrendingUp}
          description="Unpaid sales dues"
        />
        <StatCard
          title="Payables"
          value={`₹${totalPayables.toLocaleString()}`}
          icon={TrendingDown}
          description="Your outstanding debts"
        />
      </div>
    </div>
  );
}
