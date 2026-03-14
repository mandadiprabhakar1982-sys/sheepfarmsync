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
  LayoutGrid,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Banknote
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { StatCard } from '@/components/stat-card';
import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';
import { useLanguage } from '@/context/LanguageContext';

export default function OverviewPage() {
  const { 
    totalSheep, 
    totalExpenses, 
    isLoading, 
    totalReceivables, 
    totalPayables, 
    totalDead,
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    totalFarmExpenses,
  } = useFarm();
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
       <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-primary/10 rounded-full border-t-primary animate-spin" />
          <p className="text-[12px] font-black text-primary/40 animate-pulse uppercase tracking-[0.3em]">Establishing Elite Link</p>
        </div>
      </div>
    )
  }

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="flex items-center gap-4 my-8">
      <div className="h-px flex-1 bg-neutral-200" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 whitespace-nowrap px-2">
        {label}
      </span>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );

  return (
    <div className="container mx-auto py-4 px-4 md:px-10 pb-32 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <PageHeader
          title={t('farm_overview')}
          description="Operational Intelligence Command"
          className="mb-0"
        />
        <div className="w-full md:max-w-xl">
          <StatCard
            title="LIVE SHEEP INVENTORY"
            value={totalSheep.toString()}
            icon={SheepIcon}
            variant="success"
            description="Active Flock : as of Today"
            className="rounded-[2.5rem] shadow-2xl"
          />
        </div>
      </div>
      
      <div className="grid gap-10">
        {/* INVENTORY & FLOCK STATUS */}
        <section>
          <SectionLabel label="INVENTORY & FLOCK STATUS" />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <StatCard
                title="LIVE SHEEP INVENTORY"
                value={totalSheep.toString()}
                icon={SheepIcon}
                variant="success"
                description="Active Flock : as of Today"
                className="rounded-[2rem] elite-shadow"
            />
             <StatCard
                title="TOTAL MORTALITIES"
                value={totalDead.toString()}
                icon={Skull}
                variant="destructive"
                description="Loss Record : Current Cycle"
                className="rounded-[2rem] elite-shadow"
            />
          </div>
        </section>

        {/* FINANCIAL SUMMARY */}
        <section>
          <SectionLabel label="FINANCIAL SUMMARY" />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <StatCard 
              title="RECEIVABLES PENDING" 
              value={`₹${totalReceivables.toLocaleString()}`} 
              icon={TrendingUp} 
              variant="info" 
              description={totalReceivables > 0 ? "Pending collections discovered" : "Expected Inflow: No pending collections"}
              className="rounded-[2rem] elite-shadow"
            />
            <StatCard 
              title="PAYABLES DUE" 
              value={`₹${totalPayables.toLocaleString()}`} 
              icon={TrendingDown} 
              variant="coral" 
              description="Pending Outflow: Active Commitments"
              className="rounded-[2rem] elite-shadow"
            />
            <StatCard 
              title="TOTAL COST SUMMARY" 
              value={`₹${totalExpenses.toLocaleString()}`} 
              icon={IndianRupee} 
              variant="default" 
              description="Total Operational Spend: YTD"
              className="rounded-[2rem] elite-shadow"
            />
          </div>
        </section>

        {/* OPERATIONAL BREAKDOWN */}
        <section>
          <SectionLabel label="OPERATIONAL BREAKDOWN" />
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="FEED USAGE BREAKDOWN" 
              value={`₹${totalFeedCost.toLocaleString()}`} 
              icon={Wheat} 
              variant="gold" 
              description="Inventory: Wheat & Corn"
              className="rounded-2xl elite-shadow"
            />
            <StatCard 
              title="LABOR COST BREAKDOWN" 
              value={`₹${totalLaborCost.toLocaleString()}`} 
              icon={Users} 
              variant="gold" 
              description="Total Staff Hours"
              className="rounded-2xl elite-shadow"
            />
            <StatCard 
              title="MEDICAL EXPENSES" 
              value={`₹${totalMedicineCost.toLocaleString()}`} 
              icon={Syringe} 
              variant="gold" 
              description="Vaccinations & Checkups"
              className="rounded-2xl elite-shadow"
            />
            <StatCard 
              title="MISC. EXPENDITURES" 
              value={`₹${totalFarmExpenses.toLocaleString()}`} 
              icon={Banknote} 
              variant="gold" 
              description="Operational Overheads"
              className="rounded-2xl elite-shadow"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
