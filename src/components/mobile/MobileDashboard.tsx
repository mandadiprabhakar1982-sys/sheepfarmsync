'use client';

import { Card } from "@/components/ui/card";
import { PieChart, Activity, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface MobileDashboardProps {
  kpis: { title: string; value: string; icon: any }[];
  categoryTotals: Record<string, number>;
  totalCategoryAmount: number;
}

export function MobileDashboard({ kpis, categoryTotals, totalCategoryAmount }: MobileDashboardProps) {
  return (
    <div className="px-4 pt-6 space-y-6 h-full overflow-y-auto no-scrollbar pb-32 bg-slate-50">
      <div className="flex items-center justify-between mb-1">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Analytics</h2>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black tracking-widest flex items-center gap-1.5 shadow-lg">
          <Activity className="h-3 w-3 animate-pulse" /> LIVE
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="bg-white border-slate-100 p-4 flex flex-col justify-between h-32 shadow-sm rounded-2xl">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 w-fit">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.title}</p>
                <p className="text-xl font-black text-emerald-700 tracking-tighter leading-none">{item.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* SPEND MATRIX */}
      <Card className="bg-white border-slate-100 p-6 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <PieChart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Spend Matrix</h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Monthly Flow</p>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(categoryTotals).length > 0 ? Object.entries(categoryTotals).map(([cat, amt]) => {
            const percent = totalCategoryAmount > 0 ? (amt / totalCategoryAmount) * 100 : 0;
            return (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wide">
                  <span className="text-slate-500">{cat}</span>
                  <span className="text-emerald-600">₹{amt.toLocaleString()}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          }) : (
            <div className="py-10 text-center opacity-20 uppercase text-[9px] font-black text-slate-400">
              Awaiting Records
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-50 flex items-center gap-2 text-emerald-600 text-[8px] font-black uppercase tracking-widest">
          <ShieldCheck className="h-2.5 w-2.5" /> Data Integrity Active
        </div>
      </Card>
    </div>
  );
}
