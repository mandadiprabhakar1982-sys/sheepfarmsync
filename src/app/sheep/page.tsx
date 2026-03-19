'use client';

import { useMemo } from 'react';
import { Shell } from '@/components/shared/Shell';
import { useFarm } from '@/context/FarmContext';
import { WebSheepTable } from '@/components/web/WebSheepTable';
import { MobileSheepList } from '@/components/mobile/MobileSheepList';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function SheepPage() {
  const { width, isHydrated } = useWindowDimensions();
  const { trackedSheep, isLoading } = useFarm();
  const isMobile = isHydrated ? width < 768 : false;

  const stats = useMemo(() => {
    if (!trackedSheep || trackedSheep.length === 0) return { count: 0, avgWeight: 0 };
    const count = trackedSheep.length;
    const totalWeight = trackedSheep.reduce((acc, s) => acc + (s.currentWeight || 0), 0);
    return {
      count,
      avgWeight: (totalWeight / count).toFixed(1)
    };
  }, [trackedSheep]);

  if (isLoading) {
    return (
      <Shell>
        <div className="p-12 animate-pulse space-y-12 bg-white h-full">
          <div className="h-32 bg-slate-100 rounded-3xl w-2/3" />
          <div className="grid grid-cols-3 gap-12 border-t border-b border-gray-100 py-16">
            <div className="h-24 bg-slate-50 rounded-2xl" />
            <div className="h-24 bg-slate-50 rounded-2xl" />
            <div className="h-24 bg-slate-50 rounded-2xl" />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="min-h-full bg-white md:p-12 font-sans text-[#1a1a1a] overflow-y-auto no-scrollbar">
        {/* HEADER SECTION - EDITORIAL STYLE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 px-4 md:px-0 pt-8 md:pt-0">
          <div>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-emerald-600 font-black mb-4">
              Live Asset Registry • {format(new Date(), 'MMMM yyyy')}
            </p>
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-none uppercase">
              SHEEP<br className="hidden md:block" /> INVENTORY
            </h1>
          </div>
          <button className="mt-8 md:mt-0 bg-emerald-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-base md:text-lg hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-200 flex items-center gap-3 active:scale-95">
            <Plus className="h-6 w-6 stroke-[3px]" /> <span className="uppercase tracking-widest">ENROLL ANIMAL</span>
          </button>
        </header>

        {/* STATS OVERVIEW - High Fidelity Big Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-24 border-t border-b border-gray-100 py-10 md:py-16 px-4 md:px-0">
          <div>
            <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] mb-2">Total Head</p>
            <p className="text-6xl md:text-8xl font-black italic tracking-tighter">{stats.count.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] mb-2">Avg. Weight</p>
            <p className="text-6xl md:text-8xl font-black tracking-tighter">
              {stats.avgWeight}<span className="text-xl md:text-3xl ml-2 text-gray-300 font-bold">KG</span>
            </p>
          </div>
          <div>
            <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] mb-2">Health Index</p>
            <p className="text-6xl md:text-8xl font-black text-emerald-500 tracking-tighter">98%</p>
          </div>
        </div>

        {/* RESPONSIVE DATA VIEW */}
        <div className="px-4 md:px-0 pb-32">
          {isMobile ? <MobileSheepList /> : <WebSheepTable />}
        </div>
      </div>
    </Shell>
  );
}
