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
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { StatCard } from '@/components/stat-card';
import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

export default function OverviewPage() {
  const { 
    totalSheep, 
    totalExpenses, 
    totalSales, 
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
          <p className="info-text-precise text-primary/40 animate-pulse uppercase tracking-[0.3em]">Establishing Elite Link</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-4 md:px-10 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title={t('farm_overview')}
          description="Operational Intelligence Command"
        />
        <div className="px-6 py-3 bg-primary rounded-[1.5rem] text-white flex items-center gap-4 shadow-2xl elite-shadow ring-4 ring-white">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <div>
            <p className="info-text-precise opacity-40 leading-none mb-1">Audit Status</p>
            <p className="button-text-precise uppercase">Verified</p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-12">
        {/* Core Inventory Intelligence */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-primary/10" />
            <h2 className="info-text-precise text-primary/40 tracking-[0.4em] uppercase whitespace-nowrap">
              {t('inventory_status')}
            </h2>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <StatCard
                title={t('live_sheep')}
                value={totalSheep.toString()}
                icon={SheepIcon}
                variant="success"
                description="Live Assets"
            />
             <StatCard
                title={t('mortalities')}
                value={totalDead.toString()}
                icon={Skull}
                variant="destructive"
                description="Loss Record"
            />
          </div>
        </section>

        {/* Financial Flow Command */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-primary/10" />
            <h2 className="info-text-precise text-primary/40 tracking-[0.4em] uppercase whitespace-nowrap">
              {t('financial_summary')}
            </h2>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <StatCard 
              title={t('receivables')} 
              value={`₹${totalReceivables.toLocaleString()}`} 
              icon={TrendingUp} 
              variant="success" 
              description="Expected Inflow"
            />
            <StatCard 
              title={t('payables')} 
              value={`₹${totalPayables.toLocaleString()}`} 
              icon={TrendingDown} 
              variant="destructive" 
              description="Pending Outflow"
            />
            <StatCard 
              title={t('cost')} 
              value={`₹${totalExpenses.toLocaleString()}`} 
              icon={IndianRupee} 
              variant="default" 
              description="Total Operational Spend"
            />
          </div>
        </section>

        {/* Operational Deep-Dive */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-primary/10" />
            <h2 className="info-text-precise text-primary/40 tracking-[0.4em] uppercase whitespace-nowrap">
              {t('operational_breakdown')}
            </h2>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t('feed_usage')} value={`₹${totalFeedCost.toLocaleString()}`} icon={Wheat} variant="info" />
            <StatCard title={t('labor_costs')} value={`₹${totalLaborCost.toLocaleString()}`} icon={Users} variant="info" />
            <StatCard title={t('medical')} value={`₹${totalMedicineCost.toLocaleString()}`} icon={Syringe} variant="info" />
            <StatCard title={t('misc')} value={`₹${totalFarmExpenses.toLocaleString()}`} icon={Receipt} variant="info" />
          </div>
        </section>
      </div>
    </div>
  );
}