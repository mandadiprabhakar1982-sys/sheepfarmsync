'use client';

import { useFarm } from '@/context/FarmContext';
import { 
  HubSparkle, 
  IconInventory, 
  IconMortality, 
  IconReceivables, 
  IconPayables, 
  IconDisbursed, 
  IconFeedSack, 
  IconLaborUser, 
  IconMedicalPlus, 
  IconMiscBills 
} from '@/components/logo';
import { Sparkles } from 'lucide-react';

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
      <div className="flex h-screen w-full items-center justify-center bg-[#E9ECEF]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white rounded-full border-t-[#1e293b] animate-spin" />
          <p className="text-[10px] font-black text-[#1e293b]/40 uppercase tracking-[0.4em]">Linking Command Hub</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-12 py-16 animate-in fade-in duration-1000 relative">
      {/* Decorative Sparkle */}
      <Sparkles className="absolute bottom-12 right-12 h-12 w-12 text-white/40 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto space-y-12">
        {/* Centered Hub Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <HubSparkle />
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight uppercase">
              SYSTEM COMMAND HUB
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              SYNC PRO OPERATIONAL INTELLIGENCE
            </p>
          </div>
        </div>

        {/* TACTICAL GRID ARCHITECTURE */}
        <div className="grid gap-6">
          
          {/* Row 1: Primary Inventory & Loss */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="blob-card">
              <div className="icon-blob bg-[#365314] text-white">
                <IconInventory className="h-8 w-8" />
              </div>
              <div>
                <p className="blob-label">LIVE SHEEP INVENTORY</p>
                <p className="text-4xl font-black tracking-tighter">{totalSheep}</p>
              </div>
            </div>
            <div className="blob-card">
              <div className="icon-blob bg-[#991b1b] text-white">
                <IconMortality className="h-8 w-8" />
              </div>
              <div>
                <p className="blob-label">TOTAL MORTALITIES</p>
                <p className="text-4xl font-black tracking-tighter">{totalDead}</p>
              </div>
            </div>
          </div>

          {/* Row 2: Financial Stream */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="blob-card">
              <div className="icon-blob bg-[#075985] text-white">
                <IconReceivables className="h-7 w-7" />
              </div>
              <div>
                <p className="blob-label">RECEIVABLES</p>
                <p className="blob-value">₹{totalReceivables.toLocaleString()}</p>
              </div>
            </div>
            <div className="blob-card">
              <div className="icon-blob bg-[#9a3412] text-white">
                <IconPayables className="h-7 w-7" />
              </div>
              <div>
                <p className="blob-label">PAYABLES</p>
                <p className="blob-value">₹{totalPayables.toLocaleString()}</p>
              </div>
            </div>
            <div className="blob-card">
              <div className="icon-blob bg-black text-white">
                <IconDisbursed className="h-7 w-7" />
              </div>
              <div>
                <p className="blob-label">TOTAL DISBURSED</p>
                <p className="blob-value">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Row 3: Operational Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="blob-card">
              <div className="icon-blob bg-[#a16207] text-white">
                <IconFeedSack className="h-6 w-6" />
              </div>
              <div>
                <p className="blob-label">FEED</p>
                <p className="blob-value !text-lg">₹{totalFeedCost.toLocaleString()}</p>
              </div>
            </div>
            <div className="blob-card">
              <div className="icon-blob bg-[#334155] text-white">
                <IconLaborUser className="h-6 w-6" />
              </div>
              <div>
                <p className="blob-label">LABOR</p>
                <p className="blob-value !text-lg">₹{totalLaborCost.toLocaleString()}</p>
              </div>
            </div>
            <div className="blob-card">
              <div className="icon-blob bg-[#be123c] text-white">
                <IconMedicalPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="blob-label">MEDICAL</p>
                <p className="blob-value !text-lg">₹{totalMedicineCost.toLocaleString()}</p>
              </div>
            </div>
            <div className="blob-card">
              <div className="icon-blob bg-[#134e4a] text-white">
                <IconMiscBills className="h-6 w-6" />
              </div>
              <div>
                <p className="blob-label">MISC</p>
                <p className="blob-value !text-lg">₹{totalFarmExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="pt-12 border-t border-slate-300">
          <p className="text-[10px] text-slate-500 font-medium">
            * Footnote are insisted in with integrated grey professional, system and metric text and legible.
          </p>
        </div>
      </div>
    </div>
  );
}