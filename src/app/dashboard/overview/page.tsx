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
  Scale,
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';
import { StatCard } from '@/components/stat-card';
import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';
import { useLanguage } from '@/context/LanguageContext';

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
    totalFarmExpenses,
    avgWeight,
    totalDailyFeed
  } = useFarm();
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
       <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase animate-pulse">{t('syncing')}</p>
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Establishing Secure Connection...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <PageHeader
        title={t('farm_overview')}
        description={t('dashboard_desc')}
      />
      
      <div className="grid gap-10">
        <section>
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 tracking-tight text-neutral-900">
            <span className="bg-primary h-2 w-2 rounded-full"></span>
            {t('inventory_status')}
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
                title={t('live_sheep')}
                value={totalSheep.toString()}
                icon={SheepIcon}
                variant="success"
                description="Estimated current flock"
            />
            <StatCard
                title={t('tracked')}
                value={totalTracked.toString()}
                icon={ListChecks}
                variant="success"
                description="Sheep with growth logs"
            />
            <StatCard
                title={t('avg_weight')}
                value={`${avgWeight.toFixed(1)} kg`}
                icon={Scale}
                variant="info"
                description="Global mean weight"
            />
            <StatCard
                title={t('daily_feed_qty')}
                value={`${totalDailyFeed.toFixed(1)} kg`}
                icon={Wheat}
                variant="warning"
                description="Nutritional requirement"
            />
             <StatCard
                title={t('mortalities')}
                value={totalDead.toString()}
                icon={Skull}
                variant="destructive"
                description="Recorded deaths"
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 tracking-tight text-neutral-900">
            <span className="bg-primary h-2 w-2 rounded-full"></span>
            {t('financial_summary')}
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title={t('revenue')}
                value={`₹${totalSales.toLocaleString()}`}
                icon={TrendingUp}
                variant="success"
            />
            <StatCard
                title={t('cost')}
                value={`₹${totalExpenses.toLocaleString()}`}
                icon={IndianRupee}
                variant="success"
            />
             <StatCard
              title={t('receivables')}
              value={`₹${totalReceivables.toLocaleString()}`}
              icon={TrendingUp}
              variant="success"
              description="Unpaid sales"
            />
            <StatCard
              title={t('payables')}
              value={`₹${totalPayables.toLocaleString()}`}
              icon={TrendingDown}
              variant="success"
              description="Outstanding debts"
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 tracking-tight text-neutral-900">
            <span className="bg-primary h-2 w-2 rounded-full"></span>
            {t('operational_breakdown')}
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title={t('feed_usage')}
                value={`₹${totalFeedCost.toLocaleString()}`}
                icon={Wheat}
                variant="info"
            />
            <StatCard
                title={t('labor_costs')}
                value={`₹${totalLaborCost.toLocaleString()}`}
                icon={Users}
                variant="info"
            />
             <StatCard
              title={t('medical')}
              value={`₹${totalMedicineCost.toLocaleString()}`}
              icon={Syringe}
              variant="info"
            />
            <StatCard
              title={t('misc')}
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
