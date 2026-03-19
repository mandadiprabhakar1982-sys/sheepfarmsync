'use client';

import { useMemo } from 'react';
import { Shell } from '@/components/shared/Shell';
import { useFarm } from '@/context/FarmContext';
import { WebSheepTable } from '@/components/web/WebSheepTable';
import { MobileSheepList } from '@/components/mobile/MobileSheepList';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { Plus, Activity } from 'lucide-react';
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
        <div className="p-6 animate-pulse space-y-6 h-full flex flex-col">
          <div className="h-20 bg-white rounded-xl border border-slate-100" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-xl" />)}
          </div>
          <div className="flex-1 bg-white rounded-xl" />
        </div>
      </Shell>
    );
  }

  // MOBILE VIEW: Dynamic card list
  if (isMobile) {
    return (
      <Shell>
        <div className="flex flex-col h-full bg-[#f4f7f6]">
          <header className="shrink-0 p-5 bg-emerald-600 text-white shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-xl font-black uppercase tracking-tight">Flock Records</h1>
              <div className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase">Live Sync</div>
            </div>
            <p className="text-3xl font-black">#{stats.count}</p>
          </header>
          <div className="flex-1 overflow-y-auto px-4 pt-6">
            <MobileSheepList />
          </div>
          <button className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30">
            <Plus className="h-7 w-7" />
          </button>
        </div>
      </Shell>
    );
  }

  // DESKTOP VIEW: High-density compact interface
  return (
    <Shell>
      <div className="h-full bg-[#f8fafc] flex flex-col font-sans text-slate-800 overflow-hidden">
        {/* COMPACT HEADER */}
        <header className="shrink-0 flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#005f4b]">
              SHEEP<span className="text-[#14d5c7] ml-1">SYNC</span> <span className="text-slate-400 font-light ml-1 text-lg">PRO</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Inventory Management / {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
          <button className="bg-[#0FA5A0] text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-[#134E4A] transition-all flex items-center gap-2 shadow-sm active:scale-95">
            <Plus className="h-4 w-4 stroke-[3px]" /> ENROLL NEW ASSET
          </button>
        </header>

        {/* MINI STATS - Small Form Factor */}
        <div className="shrink-0 grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Head", val: stats.count.toLocaleString(), color: "text-slate-800" },
            { label: "Avg Weight", val: `${stats.avgWeight} kg`, color: "text-slate-800" },
            { label: "Health Index", val: "98%", color: "text-emerald-600" },
            { label: "Alerts", val: "0", color: "text-slate-400" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* COMPACT DATA TABLE AREA */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto no-scrollbar">
            <WebSheepTable />
          </div>
        </div>
      </div>
    </Shell>
  );
}
