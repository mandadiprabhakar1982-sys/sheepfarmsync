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
          <div className="w-12 h-12 border-4 border-white rounded-full border-t-[#65a30d] animate-spin" />
          <p className="text-[12px] font-black text-[#365314]/40 animate-pulse uppercase tracking-[0.3em]">Establishing Elite Link</p>
        </div>
      </div>
    )
  }

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="flex items-center gap-4 my-10">
      <div className="h-px flex-1 bg-[#d9e4cf]" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#365314]/40 whitespace-nowrap px-4">
        {label}
      </span>
      <div className="h-px flex-1 bg-[#d9e4cf]" />
    </div>
  );

  return (
    <div className="container mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-12">
        <div>
          <h1 className="page-title leading-tight mb-2">{t('farm_overview')}</h1>
          <p className="subtitle">Operational Intelligence Command</p>
        </div>
        
        <div className="w-full md:max-w-md">
          <StatCard
            title="LIVE SHEEP INVENTORY"
            value={totalSheep.toString()}
            icon={SheepIcon}
            variant="success"
            description="Active Flock : as of Today"
            className="shadow-2xl border-none"
          />
        </div>
      </div>
      
      <div className="grid gap-12">
        {/* INVENTORY & FLOCK STATUS */}
        <section>
          <SectionLabel label="INVENTORY & FLOCK STATUS" />
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
            <StatCard
                title="LIVE SHEEP INVENTORY"
                value={totalSheep.toString()}
                icon={SheepIcon}
                variant="success"
                description="Active Flock : as of Today"
                className="elite-shadow"
            />
             <StatCard
                title="TOTAL MORTALITIES"
                value={totalDead.toString()}
                icon={Skull}
                variant="destructive"
                description="Loss Record : Current Cycle"
                className="elite-shadow"
            />
          </div>
        </section>

        {/* FINANCIAL SUMMARY */}
        <section>
          <SectionLabel label="FINANCIAL SUMMARY" />
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            <StatCard 
              title="RECEIVABLES PENDING" 
              value={`₹${totalReceivables.toLocaleString()}`} 
              icon={TrendingUp} 
              variant="info" 
              description={totalReceivables > 0 ? "Pending collections discovered" : "Expected Inflow: No pending collections"}
              className="elite-shadow"
            />
            <StatCard 
              title="PAYABLES DUE" 
              value={`₹${totalPayables.toLocaleString()}`} 
              icon={TrendingDown} 
              variant="coral" 
              description="Pending Outflow: Active Commitments"
              className="elite-shadow"
            />
            <StatCard 
              title="TOTAL COST SUMMARY" 
              value={`₹${totalExpenses.toLocaleString()}`} 
              icon={IndianRupee} 
              variant="default" 
              description="Total Operational Spend: YTD"
              className="elite-shadow"
            />
          </div>
        </section>

        {/* OPERATIONAL BREAKDOWN */}
        <section>
          <SectionLabel label="OPERATIONAL BREAKDOWN" />
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="FEED USAGE" value={`₹${totalFeedCost.toLocaleString()}`} icon={Wheat} variant="gold" className="rounded-2xl" />
            <StatCard title="LABOR COSTS" value={`₹${totalLaborCost.toLocaleString()}`} icon={Users} variant="gold" className="rounded-2xl" />
            <StatCard title="MEDICAL" value={`₹${totalMedicineCost.toLocaleString()}`} icon={Syringe} variant="gold" className="rounded-2xl" />
            <StatCard title="MISC EXPEND" value={`₹${totalFarmExpenses.toLocaleString()}`} icon={Banknote} variant="gold" className="rounded-2xl" />
          </div>
        </section>
      </div>
    </div>
  );
}
