'use client';

import { useFarm } from '@/context/FarmContext';
import { Sparkles, TrendingUp, TrendingDown, Skull, Wheat, Users, Heart, Wallet, ReceiptIndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OverviewPage() {
  const { 
    totalSheep, 
    totalExpenses, 
    totalReceivables, 
    totalPayables, 
    totalDead,
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    totalFarmExpenses,
    isLoading 
  } = useFarm();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-200 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Linking Command Hub</p>
        </div>
      </div>
    );
  }

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-6 mb-8">
      <div className="h-px flex-1 bg-slate-200" />
      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap">{title}</h2>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );

  const TacticalCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    className 
  }: { 
    title: string, 
    value: string | number, 
    subtitle: string, 
    icon: any, 
    color: string,
    className?: string
  }) => (
    <div className={cn(
      "rounded-[2rem] p-8 flex items-center gap-6 shadow-lg transition-all hover:scale-[1.01] border border-slate-100 bg-white group",
      className
    )}>
      <div className={cn("h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-xl", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none mb-2">{value}</p>
        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300 truncate">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-full py-4 animate-in fade-in duration-1000 relative">
      <div className="max-w-[1400px] mx-auto space-y-12 relative z-10">
        
        {/* Tier 1: Inventory & Flock Status */}
        <section>
          <SectionHeader title="INVENTORY & FLOCK STATUS" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TacticalCard 
              title="LIVE SHEEP INVENTORY"
              value={totalSheep}
              subtitle="ACTIVE FLOCK : AS OF TODAY"
              icon={Sparkles}
              color="bg-emerald-600"
            />
            <TacticalCard 
              title="TOTAL MORTALITIES"
              value={totalDead}
              subtitle="LOSS RECORD : CURRENT CYCLE"
              icon={Skull}
              color="bg-rose-600"
            />
          </div>
        </section>

        {/* Tier 2: Financial Summary */}
        <section>
          <SectionHeader title="FINANCIAL SUMMARY" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TacticalCard 
              title="RECEIVABLES PENDING"
              value={`₹${totalReceivables.toLocaleString()}`}
              subtitle={totalReceivables > 0 ? "OUTSTANDING INVOICES" : "NO PENDING COLLECTIONS"}
              icon={TrendingUp}
              color="bg-sky-600"
            />
            <TacticalCard 
              title="PAYABLES DUE"
              value={`₹${totalPayables.toLocaleString()}`}
              subtitle={totalPayables > 0 ? "ACTIVE DEBT COMMITMENTS" : "ACTIVE COMMITMENTS"}
              icon={TrendingDown}
              color="bg-orange-600"
            />
            <TacticalCard 
              title="TOTAL COST SUMMARY"
              value={`₹${totalExpenses.toLocaleString()}`}
              subtitle="TOTAL OPERATIONAL SPEND: YTD"
              icon={ReceiptIndianRupee}
              color="bg-slate-900"
            />
          </div>
        </section>

        {/* Tier 3: Operational Breakdown */}
        <section>
          <SectionHeader title="OPERATIONAL BREAKDOWN" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TacticalCard 
              title="FEED USAGE"
              value={`₹${totalFeedCost.toLocaleString()}`}
              subtitle="GRAIN & INVENTORY"
              icon={Wheat}
              color="bg-amber-500"
            />
            <TacticalCard 
              title="LABOR COST"
              value={`₹${totalLaborCost.toLocaleString()}`}
              subtitle="TOTAL STAFF HOURS"
              icon={Users}
              color="bg-amber-500"
            />
            <TacticalCard 
              title="MEDICAL"
              value={`₹${totalMedicineCost.toLocaleString()}`}
              subtitle="CLINICAL CHECKUPS"
              icon={Heart}
              color="bg-amber-500"
            />
            <TacticalCard 
              title="MISC. EXPENSES"
              value={`₹${totalFarmExpenses.toLocaleString()}`}
              subtitle="GENERAL OVERHEADS"
              icon={Wallet}
              color="bg-amber-500"
            />
          </div>
        </section>

      </div>
    </div>
  );
}