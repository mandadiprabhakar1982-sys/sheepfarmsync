'use client';

import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wheat,
  Users,
  Skull,
  Syringe,
  Banknote
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { StatCard } from '@/components/stat-card';
import { useFarm } from '@/context/FarmContext';
import { useLanguage } from '@/context/LanguageContext';
import { PageHeader } from '@/components/page-header';

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
       <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white rounded-full border-t-[#16a34a] animate-spin" />
          <p className="text-[12px] font-black text-[#16a34a]/40 animate-pulse uppercase tracking-[0.3em]">Establishing Elite Link</p>
        </div>
      </div>
    )
  }

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="flex items-center gap-4 my-8">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap px-4">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );

  return (
    <div className="container mx-auto pb-32 animate-in fade-in duration-700">
      <PageHeader
        title={t('farm_overview')}
        description="Operational Intelligence Command"
      />
      
      <div className="grid gap-10">
        <section>
          <SectionLabel label="INVENTORY & FLOCK STATUS" />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <StatCard
                title="LIVE SHEEP INVENTORY"
                value={totalSheep.toString()}
                icon={SheepIcon}
                variant="success"
                description="Active Flock : as of Today"
                className="sync-card"
            />
             <StatCard
                title="TOTAL MORTALITIES"
                value={totalDead.toString()}
                icon={Skull}
                variant="destructive"
                description="Loss Record : Current Cycle"
                className="sync-card"
            />
          </div>
        </section>

        <section>
          <SectionLabel label="FINANCIAL SUMMARY" />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <StatCard 
              title="RECEIVABLES PENDING" 
              value={`₹${totalReceivables.toLocaleString()}`} 
              icon={TrendingUp} 
              variant="info" 
              description="Pending collections discovered"
              className="sync-card"
            />
            <StatCard 
              title="PAYABLES DUE" 
              value={`₹${totalPayables.toLocaleString()}`} 
              icon={TrendingDown} 
              variant="coral" 
              description="Pending Outflow: Active Commitments"
              className="sync-card"
            />
            <StatCard 
              title="TOTAL COST SUMMARY" 
              value={`₹${totalExpenses.toLocaleString()}`} 
              icon={IndianRupee} 
              variant="default" 
              description="Total Operational Spend: YTD"
              className="sync-card"
            />
          </div>
        </section>

        <section>
          <SectionLabel label="OPERATIONAL BREAKDOWN" />
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="FEED USAGE" value={`₹${totalFeedCost.toLocaleString()}`} icon={Wheat} variant="gold" className="sync-card" />
            <StatCard title="LABOR COSTS" value={`₹${totalLaborCost.toLocaleString()}`} icon={Users} variant="gold" className="sync-card" />
            <StatCard title="MEDICAL" value={`₹${totalMedicineCost.toLocaleString()}`} icon={Syringe} variant="gold" className="sync-card" />
            <StatCard title="MISC EXPEND" value={`₹${totalFarmExpenses.toLocaleString()}`} icon={Banknote} variant="gold" className="sync-card" />
          </div>
        </section>
      </div>
    </div>
  );
}