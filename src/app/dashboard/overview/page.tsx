'use client';

import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wheat,
  Users,
  Skull,
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
    totalReceivables, 
    totalPayables, 
    totalDead,
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    totalFarmExpenses
  } = useFarm();
  
  if (isLoading) {
    return (
       <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase animate-pulse">Syncing Farm Data</p>
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Establishing Secure Connection...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <PageHeader
        title="Farm Overview"
        description="COMPREHENSIVE DASHBOARD OF YOUR OPERATIONAL METRICS."
      />
      
      <div className="grid gap-10">
        <section>
          <h2 className="text-base font-black mb-6 flex items-center gap-2 tracking-tight">
            <span className="bg-primary h-2 w-2 rounded-full"></span>
            Inventory & Flock Status
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="LIVE SHEEP"
                value={totalSheep.toString()}
                icon={SheepIcon}
                variant="success"
                description="Estimated current flock"
            />
            <StatCard
                title="INDIVIDUALLY TRACKED"
                value={totalTracked.toString()}
                icon={ListChecks}
                variant="success"
                description="Sheep with growth logs"
            />
             <StatCard
                title="TOTAL MORTALITIES"
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
                title="TOTAL REVENUE"
                value={`₹${totalSales.toLocaleString()}`}
                icon={TrendingUp}
                variant="success"
            />
            <StatCard
                title="TOTAL COST"
                value={`₹${totalExpenses.toLocaleString()}`}
                icon={IndianRupee}
                variant="success"
            />
             <StatCard
              title="RECEIVABLES"
              value={`₹${totalReceivables.toLocaleString()}`}
              icon={TrendingUp}
              variant="success"
              description="Unpaid sales"
            />
            <StatCard
              title="PAYABLES"
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
                title="FEED USAGE"
                value={`₹${totalFeedCost.toLocaleString()}`}
                icon={Wheat}
                variant="info"
            />
            <StatCard
                title="LABOR COSTS"
                value={`₹${totalLaborCost.toLocaleString()}`}
                icon={Users}
                variant="info"
            />
             <StatCard
              title="MEDICAL"
              value={`₹${totalMedicineCost.toLocaleString()}`}
              icon={Syringe}
              variant="info"
            />
            <StatCard
              title="MISC."
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
