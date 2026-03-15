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
      <div className="flex h-screen w-full items-center justify-center bg-[#0a2e1a]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white/5 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.4em]">Linking Command Hub</p>
        </div>
      </div>
    );
  }

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-6 mb-8">
      <div className="h-px flex-1 bg-white/10" />
      <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60 whitespace-nowrap">{title}</h2>
      <div className="h-px flex-1 bg-white/10" />
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
      "rounded-[1.5rem] p-8 flex items-center gap-6 shadow-2xl transition-all hover:scale-[1.02] border border-white/5",
      color,
      className
    )}>
      <div className="h-12 w-12 shrink-0 rounded-xl bg-black/20 flex items-center justify-center text-white">
        <Icon className="h-6 w-6 opacity-80" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60 mb-1">{title}</p>
        <p className="text-3xl font-black tracking-tighter text-white leading-none mb-2">{value}</p>
        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 truncate">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-full px-4 md:px-12 py-12 animate-in fade-in duration-1000 relative bg-[#0a2e1a]">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto space-y-16 relative z-10">
        
        {/* Tier 1: Inventory & Flock Status */}
        <section>
          <SectionHeader title="INVENTORY & FLOCK STATUS" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TacticalCard 
              title="LIVE SHEEP INVENTORY"
              value={totalSheep}
              subtitle="ACTIVE FLOCK : AS OF TODAY"
              icon={Sparkles}
              color="bg-[#1a4d2e]"
            />
            <TacticalCard 
              title="TOTAL MORTALITIES"
              value={totalDead}
              subtitle="LOSS RECORD : CURRENT CYCLE"
              icon={Skull}
              color="bg-[#991b1b]"
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
              subtitle={totalReceivables > 0 ? "OUTSTANDING INVOICES" : "EXPECTED INFLOW: NO PENDING COLLECTIONS"}
              icon={TrendingUp}
              color="bg-[#5b84a1]"
            />
            <TacticalCard 
              title="PAYABLES DUE"
              value={`₹${totalPayables.toLocaleString()}`}
              subtitle={totalPayables > 0 ? "ACTIVE DEBT COMMITMENTS" : "PENDING OUTFLOW: ACTIVE COMMITMENTS"}
              icon={TrendingDown}
              color="bg-[#b05642]"
            />
            <TacticalCard 
              title="TOTAL COST SUMMARY"
              value={`₹${totalExpenses.toLocaleString()}`}
              subtitle="TOTAL OPERATIONAL SPEND: YTD"
              icon={ReceiptIndianRupee}
              color="bg-black"
            />
          </div>
        </section>

        {/* Tier 3: Operational Breakdown */}
        <section>
          <SectionHeader title="OPERATIONAL BREAKDOWN" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TacticalCard 
              title="FEED USAGE BREAKDOWN"
              value={`₹${totalFeedCost.toLocaleString()}`}
              subtitle="INVENTORY: WHEAT & CORN"
              icon={Wheat}
              color="bg-[#a68a56]"
            />
            <TacticalCard 
              title="LABOR COST BREAKDOWN"
              value={`₹${totalLaborCost.toLocaleString()}`}
              subtitle="TOTAL STAFF HOURS"
              icon={Users}
              color="bg-[#a68a56]"
            />
            <TacticalCard 
              title="MEDICAL EXPENSES"
              value={`₹${totalMedicineCost.toLocaleString()}`}
              subtitle="VACCINATIONS & CHECKUPS"
              icon={Heart}
              color="bg-[#a68a56]"
            />
            <TacticalCard 
              title="MISC. EXPENDITURES"
              value={`₹${totalFarmExpenses.toLocaleString()}`}
              subtitle="OPERATIONAL OVERHEADS"
              icon={Wallet}
              color="bg-[#a68a56]"
            />
          </div>
        </section>

      </div>

      {/* Decorative Elements */}
      <div className="fixed bottom-12 right-12 text-white/20 pointer-events-none group">
        <div className="relative">
          <Sparkles className="h-10 w-10 animate-pulse" />
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150" />
        </div>
      </div>
    </div>
  );
}
