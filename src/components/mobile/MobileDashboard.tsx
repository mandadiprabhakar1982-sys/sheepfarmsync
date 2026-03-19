'use client';

import { Card } from "@/components/ui/card";
import { PieChart, TrendingUp, Activity, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface MobileDashboardProps {
  kpis: { title: string; value: string; icon: any }[];
  categoryTotals: Record<string, number>;
  totalCategoryAmount: number;
}

export function MobileDashboard({ kpis, categoryTotals, totalCategoryAmount }: MobileDashboardProps) {
  return (
    <div className="px-5 pt-10 space-y-8 h-full overflow-y-auto no-scrollbar pb-32 bg-slate-50">
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Analytics</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/20">
          <Activity className="h-3 w-3 animate-pulse" /> LIVE
        </div>
      </div>

      {/* KPI GRID - Mobile Match */}
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="bg-white border-slate-100 p-6 flex flex-col justify-between h-40 shadow-sm rounded-3xl">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 w-fit">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.title}</p>
                <p className="text-2xl font-black text-emerald-700 tracking-tighter leading-none">{item.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* SPEND MATRIX - Mobile Match */}
      <Card className="bg-white border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Spend Matrix</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Monthly Flow</p>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(categoryTotals).length > 0 ? Object.entries(categoryTotals).map(([cat, amt]) => {
            const percent = totalCategoryAmount > 0 ? (amt / totalCategoryAmount) * 100 : 0;
            return (
              <div key={cat} className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-wide">
                  <span className="text-slate-500">{cat}</span>
                  <span className="text-emerald-600">₹{amt.toLocaleString()}</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          }) : (
            <div className="py-10 text-center opacity-20 uppercase text-[10px] font-black text-slate-400">
              Awaiting Records
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-50 flex items-center gap-2 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3" /> Data Integrity Guaranteed
        </div>
      </Card>
    </div>
  );
}
