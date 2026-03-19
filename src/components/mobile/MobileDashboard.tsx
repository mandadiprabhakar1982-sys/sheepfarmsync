'use client';

import { Card } from "@/components/ui/card";
import { Activity, PieChart, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface MobileDashboardProps {
  kpis: { title: string; value: string }[];
  categoryTotals: Record<string, number>;
  totalCategoryAmount: number;
}

export function MobileDashboard({ kpis, categoryTotals, totalCategoryAmount }: MobileDashboardProps) {
  return (
    <div className="px-5 pt-6 space-y-8 h-full overflow-y-auto no-scrollbar pb-32">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Farm Analytics</h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black tracking-widest flex items-center gap-2">
          <Activity className="h-3 w-3" /> LIVE
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((item, i) => (
          <Card key={i} className="bg-white/5 border-white/10 p-6 flex flex-col justify-between h-32">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{item.title}</p>
            <p className="text-2xl font-black text-white">{item.value}</p>
          </Card>
        ))}
      </div>

      {/* SPEND MATRIX */}
      <Card className="bg-neutral-900 border-white/5 p-8 rounded-[2rem]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-white/5 text-emerald-400">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Spend Matrix</h3>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Monthly Breakdown</p>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(categoryTotals).length > 0 ? Object.entries(categoryTotals).map(([cat, amt]) => {
            const percent = totalCategoryAmount > 0 ? (amt / totalCategoryAmount) * 100 : 0;
            return (
              <div key={cat}>
                <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-wide text-white/60">
                  <span>{cat}</span>
                  <span className="text-emerald-400">₹{amt.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          }) : (
            <div className="py-10 text-center opacity-20 uppercase text-[10px] font-black text-white">
              Awaiting Records
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3" /> Integrity Verified
        </div>
      </Card>
    </div>
  );
}
