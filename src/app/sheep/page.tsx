'use client';

import { Shell } from '@/components/shared/Shell';
import { useFarm } from '@/context/FarmContext';
import { WebSheepTable } from '@/components/web/WebSheepTable';
import { MobileSheepList } from '@/components/mobile/MobileSheepList';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function SheepPage() {
  const { width, isHydrated } = useWindowDimensions();
  const isMobile = isHydrated ? width < 768 : false;

  return (
    <Shell>
      <div className="h-full flex flex-col">
        <header className="shrink-0 flex items-center justify-between mb-8 px-4 md:px-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 md:text-slate-800 text-white uppercase">Sheep Inventory</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live Asset Registry</p>
          </div>
          <button className="h-12 w-12 md:h-14 md:w-auto md:px-8 rounded-2xl bg-[#0FA5A0] text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
            <Plus className="h-6 w-6" />
            <span className="hidden md:inline font-black uppercase text-xs">Enroll Animal</span>
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          {isMobile ? <MobileSheepList /> : <WebSheepTable />}
        </div>
      </div>
    </Shell>
  );
}