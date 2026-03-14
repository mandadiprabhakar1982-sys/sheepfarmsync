'use client';

import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wheat,
  Users,
  Skull,
  Syringe,
  Banknote,
  LayoutGrid
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

  return (
    <div className="container mx-auto pb-32 animate-in fade-in duration-700">
      <PageHeader
        title="Farm Overview"
        description="Operational Intelligence Command"
      />
      
      <div className="grid gap-12 mt-10">
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory & Flock Status</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <StatCard
                title="LIVE SHEEP INVENTORY"
                value={totalSheep.toString()}
                icon={SheepIcon}
                variant="success"
                className="form-card border-l-4 border-[#16a34a]"
            />
             <StatCard
                title="TOTAL MORTALITIES"
                value={totalDead.toString()}
                icon={Skull}
                variant="destructive"
                className="form-card border-l-4 border-rose-600"
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Financial Summary</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <StatCard 
              title="RECEIVABLES" 
              value={`₹${totalReceivables.toLocaleString()}`} 
              icon={TrendingUp} 
              variant="info" 
              className="form-card border-l-4 border-blue-500"
            />
            <StatCard 
              title="PAYABLES" 
              value={`₹${totalPayables.toLocaleString()}`} 
              icon={TrendingDown} 
              variant="coral" 
              className="form-card border-l-4 border-rose-500"
            />
            <StatCard 
              title="TOTAL DISBURSED" 
              value={`₹${totalExpenses.toLocaleString()}`} 
              icon={IndianRupee} 
              className="form-card border-l-4 border-[#16a34a]"
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Operational Breakdown</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="FEED" value={`₹${totalFeedCost.toLocaleString()}`} icon={Wheat} variant="neutral" className="form-card border-t-4 border-[#84cc16]" />
            <StatCard title="LABOR" value={`₹${totalLaborCost.toLocaleString()}`} icon={Users} variant="neutral" className="form-card border-t-4 border-[#f59e0b]" />
            <StatCard title="MEDICAL" value={`₹${totalMedicineCost.toLocaleString()}`} icon={Syringe} variant="neutral" className="form-card border-t-4 border-[#14b8a6]" />
            <StatCard title="MISC" value={`₹${totalFarmExpenses.toLocaleString()}`} icon={Banknote} variant="neutral" className="form-card border-t-4 border-[#64748b]" />
          </div>
        </section>
      </div>
    </div>
  );
}