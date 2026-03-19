'use client';

import { Shell } from '@/components/shared/Shell';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { Scale, Calculator, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function WeightPage() {
  const { width, isHydrated } = useWindowDimensions();
  const { totalSheep } = useFarm();
  const isMobile = isHydrated ? width < 768 : false;

  return (
    <Shell>
      <div className="h-full flex flex-col">
        <header className="shrink-0 flex items-center justify-between mb-8 px-4 md:px-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 md:text-slate-800 text-white uppercase">Growth Audit</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Weight Tracking & Projections</p>
          </div>
          <Link href="/calculator">
            <button className="h-12 w-12 md:h-14 md:w-auto md:px-8 rounded-2xl bg-[#0FA5A0] text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
              <Calculator className="h-6 w-6" />
              <span className="hidden md:inline font-black uppercase text-xs">Nutrition Calc</span>
            </button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
          <Card className="bg-[#14d5c7] border-none p-8">
            <h3 className="text-black/40 text-[10px] font-black uppercase tracking-widest mb-2">Avg Flock Weight</h3>
            <p className="text-4xl font-black text-black">28.4 <span className="text-xl">KG</span></p>
          </Card>
          <Card className={isMobile ? "bg-white/5 border-white/10 p-8" : "bg-white border-none shadow-xl p-8"}>
            <h3 className={isMobile ? "text-white/40 text-[10px] font-black uppercase tracking-widest mb-2" : "text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2"}>Monthly Gain</h3>
            <p className={isMobile ? "text-4xl font-black text-white" : "text-4xl font-black text-[#0FA5A0]"}>+2.1 <span className="text-xl">KG</span></p>
          </Card>
          <Card className={isMobile ? "bg-white/5 border-white/10 p-8" : "bg-white border-none shadow-xl p-8"}>
            <h3 className={isMobile ? "text-white/40 text-[10px] font-black uppercase tracking-widest mb-2" : "text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2"}>Target 150D</h3>
            <p className={isMobile ? "text-4xl font-black text-white" : "text-4xl font-black text-slate-900"}>45.0 <span className="text-xl">KG</span></p>
          </Card>
        </div>

        <div className="mt-10 px-4 md:px-0">
          <div className={isMobile ? "bg-white/5 rounded-[2rem] p-8 border border-white/5" : "bg-white rounded-[2rem] p-10 shadow-xl"}>
            <h4 className={isMobile ? "text-white font-black uppercase mb-6" : "text-slate-800 font-black uppercase mb-6"}>Performance Trends</h4>
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
              <p className="text-white/20 font-black uppercase text-[10px] tracking-widest">Growth Visualization Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}