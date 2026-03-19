'use client';

import { Shell } from '@/components/shared/Shell';
import { WebLedgerTable } from '@/components/web/WebLedgerTable';
import { MobileLedgerCards } from '@/components/mobile/MobileLedgerCards';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useFarm } from '@/context/FarmContext';

export default function LedgerPage() {
  const { width, isHydrated } = useWindowDimensions();
  const { totalSales, totalExpenses } = useFarm();
  const isMobile = isHydrated ? width < 768 : false;

  return (
    <Shell>
      <div className="h-full flex flex-col">
        <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-4 md:px-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 md:text-slate-800 text-white uppercase">Farm Ledger</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Unified Transactional Audit</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-6 py-2.5 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
              <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-[8px] font-black uppercase opacity-40 leading-none">Sales</p>
                <p className="text-lg font-black tracking-tight">₹{totalSales.toLocaleString()}</p>
              </div>
            </div>
            <button className="h-12 w-12 md:h-14 md:w-auto md:px-8 rounded-2xl bg-[#0FA5A0] text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
              <Plus className="h-6 w-6" />
              <span className="hidden md:inline font-black uppercase text-xs">Add Record</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {isMobile ? <MobileLedgerCards /> : <WebLedgerTable />}
        </div>
      </div>
    </Shell>
  );
}