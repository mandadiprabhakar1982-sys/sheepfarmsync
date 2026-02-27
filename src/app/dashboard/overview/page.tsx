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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

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
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Farm Overview"
        description="Comprehensive dashboard of your operational metrics."
      />
      
      <div className="grid gap-6">
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="bg-primary h-2 w-2 rounded-full"></span>
            Inventory & Flock Status
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Live Sheep"
                value={totalSheep.toString()}
                icon={SheepIcon}
                description="Estimated current flock"
            />
            <StatCard
                title="Individually Tracked"
                value={totalTracked.toString()}
                icon={ListChecks}
                description="Sheep with growth logs"
            />
             <StatCard
                title="Total Mortalities"
                value={totalDead.toString()}
                icon={Skull}
                description="Recorded deaths"
                className="bg-red-50/50"
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="bg-green-600 h-2 w-2 rounded-full"></span>
            Financial Summary
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Revenue"
                value={`₹${totalSales.toLocaleString()}`}
                icon={TrendingUp}
                className="bg-green-50/30"
            />
            <StatCard
                title="Total Cost"
                value={`₹${totalExpenses.toLocaleString()}`}
                icon={IndianRupee}
            />
             <StatCard
              title="Receivables"
              value={`₹${totalReceivables.toLocaleString()}`}
              icon={TrendingUp}
              description="Unpaid sales"
            />
            <StatCard
              title="Payables"
              value={`₹${totalPayables.toLocaleString()}`}
              icon={TrendingDown}
              description="Outstanding debts"
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="bg-blue-600 h-2 w-2 rounded-full"></span>
            Operational Breakdown
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Feed Usage"
                value={`₹${totalFeedCost.toLocaleString()}`}
                icon={Wheat}
            />
            <StatCard
                title="Labor Costs"
                value={`₹${totalLaborCost.toLocaleString()}`}
                icon={Users}
            />
            <StatCard
                title="Medical"
                value={`₹${totalMedicineCost.toLocaleString()}`}
                icon={Syringe}
            />
            <StatCard
                title="Misc."
                value={`₹${totalFarmExpenses.toLocaleString()}`}
                icon={Receipt}
            />
          </div>
        </section>
      </div>
    </div>
  );
}