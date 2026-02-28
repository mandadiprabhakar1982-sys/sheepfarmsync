'use client';

import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wheat,
  Users,
  Skull,
  Loader2,
  Syringe,
  Receipt,
  ListChecks,
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { StatCard } from '@/components/stat-card';
import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';

export default function OverviewPage() {
  const { 
    totalSheep, 
    totalTracked, 
    totalExpenses, 
    totalSales, 
    isLoading, 
    totalFeedCost, 
    totalLaborCost, 
    totalMedicineCost, 
    totalFarmExpenses, 
    totalReceivables, 
    totalPayables, 
    totalDead 
  } = useFarm();
  
  if (isLoading) {
    return (
       <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <PageHeader
        title="Farm Overview"
        description="Comprehensive dashboard of your operational metrics."
      />
      
      <div className="grid gap-10">
        <section>
          <h2 className="text-base font-black mb-6 flex items-center gap-2 tracking-tight">
            <span className="bg-primary h-2 w-2 rounded-full"></span>
            Inventory & Flock Status
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Live Sheep"
                value={totalSheep.toString()}
                icon={SheepIcon}
                variant="success"
                description="Estimated current flock"
            />
            <StatCard
                title="Individually Tracked"
                value={totalTracked.toString()}
                icon={ListChecks}
                variant="success"
                description="Sheep with growth logs"
            />
             <StatCard
                title="Total Mortalities"
                value={totalDead.toString()}
                icon={Skull}
                variant="destructive"
                description="Recorded deaths"
            />
          </div>
        </section>

        <section>
          <h2 className="text-base font-black mb-6 flex items-center gap-2 tracking-tight">
            <span className="bg-primary h-2 w-2 rounded-full"></span>
            Financial Summary
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Revenue"
                value={`₹${totalSales.toLocaleString()}`}
                icon={TrendingUp}
                variant="success"
            />
            <StatCard
                title="Total Cost"
                value={`₹${totalExpenses.toLocaleString()}`}
                icon={IndianRupee}
                variant="success"
            />
             <StatCard
              title="Receivables"
              value={`₹${totalReceivables.toLocaleString()}`}
              icon={TrendingUp}
              variant="success"
              description="Unpaid sales"
            />
            <StatCard
              title="Payables"
              value={`₹${totalPayables.toLocaleString()}`}
              icon={TrendingDown}
              variant="success"
              description="Outstanding debts"
            />
          </div>
        </section>

        <section>
          <h2 className="text-base font-black mb-6 flex items-center gap-2 tracking-tight">
            <span className="bg-primary h-2 w-2 rounded-full"></span>
            Operational Breakdown
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Feed Usage"
                value={`₹${totalFeedCost.toLocaleString()}`}
                icon={Wheat}
                variant="info"
            />
            <StatCard
                title="Labor Costs"
                value={`₹${totalLaborCost.toLocaleString()}`}
                icon={Users}
                variant="info"
            />
            <StatCard
                title="Medical"
                value={`₹${totalMedicineCost.toLocaleString()}`}
                icon={Syringe}
                variant="info"
            />
            <StatCard
                title="Misc."
                value={`₹${totalFarmExpenses.toLocaleString()}`}
                icon={Receipt}
                variant="info"
            />
          </div>
        </section>
      </div>
    </div>
  );
}